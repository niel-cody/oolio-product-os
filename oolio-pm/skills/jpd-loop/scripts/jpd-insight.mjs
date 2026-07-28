#!/usr/bin/env node
/**
 * jpd-insight — create and read native Insights on Jira Product Discovery ideas.
 *
 * The Rovo/Atlassian MCP cannot write Insights. The only supported route is the
 * Polaris GraphQL API behind a 3LO OAuth token. This helper owns the whole of
 * that: token storage, silent refresh, ID lookup, and the mutation itself, so
 * the skills call one command instead of hand-rolling curl.
 *
 * Credentials and tokens live at ~/.jpd-insights-token.json (mode 600).
 * Nothing secret belongs in this file or anywhere in this repo.
 *
 * Usage:
 *   jpd-insight.mjs auth --client-id ID --client-secret SECRET [--site oolio.atlassian.net]
 *   jpd-insight.mjs whoami
 *   jpd-insight.mjs get OHSI-123
 *   jpd-insight.mjs get --project            # every insight in the project
 *   jpd-insight.mjs create --idea OHSI-123 --description "..." --url "https://..." \
 *                          [--quote "..."] [--title "..."] [--icon "https://..."] \
 *                          [--group "Research"] [--labels "competitor,pricing"]
 *   jpd-insight.mjs create --file batch.json # array of the same option objects
 */

import http from 'http';
import { URL } from 'url';
import { readFileSync, writeFileSync, existsSync, chmodSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';

const TOKEN_FILE = join(homedir(), '.jpd-insights-token.json');
const REDIRECT_URI = 'http://localhost:7777';
const SCOPES = 'read:jira-user read:jira-work write:jira-work offline_access';
const GRAPHQL = 'https://api-private.atlassian.com/graphql';
const DEFAULT_SITE = 'oolio.atlassian.net';

// ---------------------------------------------------------------- arg parsing

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

// ------------------------------------------------------------------- storage

function loadStore() {
  if (!existsSync(TOKEN_FILE)) die(`no credentials at ${TOKEN_FILE}. Run: jpd-insight.mjs auth --client-id ID --client-secret SECRET`);
  return JSON.parse(readFileSync(TOKEN_FILE, 'utf8'));
}

// Merge on write rather than overwrite. A caller can hold a copy of the store
// from before an api() call refreshed the token underneath it; writing that copy
// back verbatim would restore the old refresh token, and since Atlassian rotates
// them, the old one may already be dead. Losing the refresh token means a full
// browser re-auth, so this is worth the extra read.
function saveStore(patch) {
  const current = existsSync(TOKEN_FILE) ? JSON.parse(readFileSync(TOKEN_FILE, 'utf8')) : {};
  writeFileSync(TOKEN_FILE, JSON.stringify({ ...current, ...patch }, null, 2));
  chmodSync(TOKEN_FILE, 0o600);
}

// ------------------------------------------------------------------ auth flow

async function exchange(body) {
  const res = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
}

async function cmdAuth(args) {
  const existing = existsSync(TOKEN_FILE) ? JSON.parse(readFileSync(TOKEN_FILE, 'utf8')) : {};
  const clientId = args['client-id'] || existing.client_id;
  const clientSecret = args['client-secret'] || existing.client_secret;
  const site = args.site || existing.site || DEFAULT_SITE;
  if (!clientId || !clientSecret) die('need --client-id and --client-secret');

  const state = randomBytes(12).toString('hex');
  const authUrl = 'https://auth.atlassian.com/authorize'
    + '?audience=api.atlassian.com'
    + `&client_id=${encodeURIComponent(clientId)}`
    + `&scope=${encodeURIComponent(SCOPES)}`
    + `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    + `&state=${state}`
    + '&response_type=code&prompt=consent';

  console.log('\nOpen this URL and click Accept:\n');
  console.log(authUrl);
  console.log('\nWaiting for the redirect (5 minute timeout)...\n');

  await new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      const code = url.searchParams.get('code');
      const returned = url.searchParams.get('state');
      if (!code) { res.end('No code in the callback.'); return; }
      if (returned !== state) {
        res.end('State mismatch. Authorisation rejected.');
        console.error('✗ state mismatch — aborting');
        server.close(); resolve(); return;
      }

      const { data } = await exchange({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: REDIRECT_URI,
      });

      if (!data.access_token) {
        console.error('✗ token exchange failed:', JSON.stringify(data));
        res.end('Authorisation failed. Check the client ID and secret.');
        server.close(); resolve(); return;
      }

      saveStore({
        client_id: clientId,
        client_secret: clientSecret,
        site,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
      });

      res.setHeader('Content-Type', 'text/html');
      res.end('<h2>Authorised. You can close this tab.</h2>');
      console.log(`✓ token saved to ${TOKEN_FILE}`);
      console.log(`  scopes: ${data.scope}`);
      console.log(`  refresh token: ${data.refresh_token ? 'yes' : 'NO — offline_access was not granted'}`);
      server.close(); resolve();
    });
    server.on('error', (e) => {
      console.error(`✗ cannot listen on port 7777: ${e.message}`);
      console.error("  free it with: lsof -ti:7777 | xargs kill");
      resolve();
    });
    server.listen(7777);
    // unref so a successful auth exits immediately instead of the process sitting
    // idle until this timer fires. Node keeps the loop alive for a pending timer.
    setTimeout(() => {
      console.error('✗ timed out waiting for the redirect. Re-run and click Accept sooner.');
      server.close(); resolve();
    }, 300000).unref();
  });

  if (existsSync(TOKEN_FILE)) await resolveCloudId();
}

async function accessToken() {
  const store = loadStore();
  if (store.access_token && Date.now() < store.expires_at - 60000) return store.access_token;
  if (!store.refresh_token) die('access token expired and no refresh token. Re-run: jpd-insight.mjs auth');

  const { data } = await exchange({
    grant_type: 'refresh_token',
    client_id: store.client_id,
    client_secret: store.client_secret,
    refresh_token: store.refresh_token,
  });
  if (!data.access_token) die(`refresh failed (${JSON.stringify(data)}). Delete ${TOKEN_FILE} and re-run auth.`);

  saveStore({
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    ...(data.refresh_token ? { refresh_token: data.refresh_token } : {}),
  });
  return data.access_token;
}

// -------------------------------------------------------------- id resolution

async function api(path, { soft = false } = {}) {
  const token = await accessToken();
  const res = await fetch(`https://api.atlassian.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    if (soft) return null;
    die(`GET ${path} → ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function resolveCloudId() {
  const store = loadStore();
  if (store.cloud_id) return store.cloud_id;
  const resources = await api('/oauth/token/accessible-resources');
  const match = resources.find((r) => r.url.includes(store.site || DEFAULT_SITE));
  if (!match) die(`site ${store.site || DEFAULT_SITE} not in accessible resources: ${resources.map((r) => r.url).join(', ')}`);
  saveStore({ cloud_id: match.id });
  console.log(`✓ cloud id for ${match.url}: ${match.id}`);
  return match.id;
}

const issueCache = new Map();
async function resolveIssue(key) {
  if (issueCache.has(key)) return issueCache.get(key);
  const cloudId = await resolveCloudId();
  const issue = await api(`/ex/jira/${cloudId}/rest/api/3/issue/${key}?fields=project,summary`);
  const out = { cloudId, issueId: issue.id, projectId: issue.fields.project.id, summary: issue.fields.summary };
  issueCache.set(key, out);
  return out;
}

// -------------------------------------------------------------------- graphql

async function graphql(query, variables) {
  const token = await accessToken();
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-ExperimentalApi': 'polaris-v0',
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (body.errors) die(`GraphQL: ${JSON.stringify(body.errors)}`);
  return body.data;
}

const GET_QUERY = `query getPolarisInsights($project: ID!, $container: ID) {
  polarisInsights(project: $project, container: $container) {
    id container description snippets { id url data properties } created updated
  }
}`;

const CREATE_MUTATION = `mutation createInsight($input: CreatePolarisInsightInput!) {
  createPolarisInsight(input: $input) {
    success
    errors { message }
    node { id container created }
  }
}`;

async function cmdGet(args) {
  const key = args._[1];
  const store = loadStore();
  const cloudId = await resolveCloudId();
  let projectId, container = null;

  if (key) {
    const issue = await resolveIssue(key);
    projectId = issue.projectId;
    container = `ari:cloud:jira:${cloudId}:issue/${issue.issueId}`;
  } else {
    projectId = args.project === true ? store.project_id : args.project;
    if (!projectId) die('give an idea key, or --project <PROJECT_ID>');
  }

  const data = await graphql(GET_QUERY, {
    project: `ari:cloud:jira:${cloudId}:project/${projectId}`,
    ...(container ? { container } : {}),
  });
  console.log(JSON.stringify(data.polarisInsights, null, 2));
}

function adf(text) {
  return { version: 1, type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] };
}

// Match the icon and group convention JPD itself writes, so agent-created cards
// are visually indistinguishable from ones added by hand in the UI.
function faviconFor(url) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
  } catch {
    return 'https://www.google.com/s2/favicons?domain=oolio.com&sz=32';
  }
}

async function createOne(spec, clientId) {
  const key = spec.idea || spec.key;
  if (!key) die('each insight needs --idea <KEY>');
  if (!spec.description) die(`${key}: --description is required`);
  if (!spec.url) die(`${key}: --url is required (an Insight with no followable source is not evidence)`);

  const { cloudId, issueId, projectId, summary } = await resolveIssue(key);
  const labels = typeof spec.labels === 'string' ? spec.labels.split(',').map((s) => s.trim()).filter(Boolean) : (spec.labels || []);

  const snippet = {
    oauthClientId: clientId,
    url: spec.url,
    data: {
      type: 'quotes',
      group: spec.group
        ? { name: spec.group, id: spec.group.toLowerCase().replace(/\s+/g, '_') }
        : { name: 'Web Page', id: 'web' },
      context: {
        icon: spec.icon || faviconFor(spec.url),
        url: spec.url,
        title: spec.title || spec.url,
      },
      content: [{ type: 'quotesItem', quote: spec.quote || spec.description }],
      ...(labels.length ? { properties: { labels: { name: 'Labels', value: labels } } } : {}),
    },
  };

  const data = await graphql(CREATE_MUTATION, {
    input: {
      cloudID: cloudId,
      projectID: projectId,
      issueID: issueId,
      description: adf(spec.description),
      data: [],
      snippets: [snippet],
    },
  });

  const result = data.createPolarisInsight;
  if (!result?.success) die(`${key}: create failed — ${JSON.stringify(result?.errors)}`);
  console.log(`✓ ${key} (${summary}) → ${result.node.id}`);
  return result.node.id;
}

async function cmdCreate(args) {
  const { client_id: clientId } = loadStore();
  const specs = args.file
    ? JSON.parse(readFileSync(args.file, 'utf8'))
    : [args];
  if (!Array.isArray(specs)) die('--file must contain a JSON array of insight objects');
  for (const spec of specs) await createOne(spec, clientId);
  console.log(`\n${specs.length} insight${specs.length === 1 ? '' : 's'} created.`);
}

async function cmdWhoami() {
  const store = loadStore();
  const resources = await api('/oauth/token/accessible-resources');
  console.log(`site:      ${store.site}`);
  console.log(`cloud id:  ${store.cloud_id || '(not resolved yet)'}`);
  console.log(`token:     valid until ${new Date(store.expires_at).toISOString()}`);
  console.log(`resources: ${resources.map((r) => r.url).join(', ')}`);
}

// ----------------------------------------------------------------------- main

const args = parseArgs(process.argv.slice(2));
const command = args._[0];

const commands = { auth: cmdAuth, get: cmdGet, create: cmdCreate, whoami: cmdWhoami };
if (!commands[command]) {
  console.error('usage: jpd-insight.mjs <auth|whoami|get|create> [options]');
  process.exit(1);
}
await commands[command](args);
