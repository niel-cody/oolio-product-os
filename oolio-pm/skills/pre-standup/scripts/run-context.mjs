#!/usr/bin/env node
/**
 * run-context: what today's pre-standup run needs to know before it reads Jira or Slack.
 *
 * The agent does the reading, writing and posting. This script settles the deterministic
 * parts so no run gets them wrong at 07:00 with nobody watching:
 *
 *   - today's date in Sydney, and whether it is a working day (weekday, not a NSW public holiday)
 *   - the previous working day, so "Yesterday" covers the weekend on a Monday and a holiday after it
 *   - the last daily log in the Brain, and per team: last incident count, days at zero so far,
 *     how yesterday's post was delivered, and whether a run already happened today
 *   - the thought-for-the-day lines used in the last twenty logs, so the rotation holds
 *
 * It never writes.
 *
 * Usage:
 *   node run-context.mjs                 JSON for today
 *   node run-context.mjs --date 2026-10-12
 *   node run-context.mjs --pretty
 *
 * Vault: ~/my_brain, or --vault PATH, or the MY_BRAIN environment variable.
 * Config: ../config/teams.json next to this script, or --config PATH.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flags = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--pretty') flags.pretty = true;
  else if (a === '--date') flags.date = argv[++i];
  else if (a === '--vault') flags.vault = argv[++i];
  else if (a === '--config') flags.config = argv[++i];
}

const VAULT = resolve(flags.vault || process.env.MY_BRAIN || join(homedir(), 'my_brain'));
const CONFIG = resolve(flags.config || join(HERE, '..', 'config', 'teams.json'));
const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const TZ = config.schedule?.timezone || 'Australia/Sydney';

// NSW public holidays. Refresh each January from nsw.gov.au; the run skips these days.
// A date here that is not a NSW holiday costs a missed post; a NSW holiday missing here costs a
// post nobody reads. Both are visible in the log, neither is silent.
const NSW_HOLIDAYS = {
  '2026-01-01': "New Year's Day",
  '2026-01-26': 'Australia Day',
  '2026-04-03': 'Good Friday',
  '2026-04-04': 'Easter Saturday',
  '2026-04-05': 'Easter Sunday',
  '2026-04-06': 'Easter Monday',
  '2026-04-25': 'Anzac Day',
  '2026-06-08': "King's Birthday",
  '2026-10-05': 'Labour Day',
  '2026-12-25': 'Christmas Day',
  '2026-12-26': 'Boxing Day',
  '2026-12-28': 'Boxing Day (additional day)',
  '2027-01-01': "New Year's Day",
  '2027-01-26': 'Australia Day',
  '2027-03-26': 'Good Friday',
  '2027-03-27': 'Easter Saturday',
  '2027-03-28': 'Easter Sunday',
  '2027-03-29': 'Easter Monday',
  '2027-04-25': 'Anzac Day',
  '2027-06-14': "King's Birthday",
  '2027-10-04': 'Labour Day',
  '2027-12-25': 'Christmas Day',
  '2027-12-26': 'Boxing Day',
  '2027-12-27': 'Christmas Day (additional day)',
  '2027-12-28': 'Boxing Day (additional day)',
};

// ------------------------------------------------------------------ dates
const isoInTz = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const parseIso = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) throw new Error(`bad date: ${s}`);
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
};
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
const weekday = (d) => d.getUTCDay(); // 0 Sunday .. 6 Saturday
const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const holidayOf = (d) => NSW_HOLIDAYS[iso(d)] || null;
const isWorkingDay = (d) => weekday(d) >= 1 && weekday(d) <= 5 && !holidayOf(d);

const today = flags.date ? parseIso(flags.date) : parseIso(isoInTz(new Date()));
let prev = addDays(today, -1);
while (!isWorkingDay(prev)) prev = addDays(prev, -1);
const lookbackDays = Math.round((today - prev) / 86400000);

const dayLabel = (d) =>
  `${WEEKDAY[weekday(d)].slice(0, 3)} ${d.getUTCDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]}`;

// ------------------------------------------------------------------ logs
const logRoot = join(VAULT, config.brain?.logFolder || '02 Daily Briefs/Pre-Standup');
const logFiles = [];
if (existsSync(logRoot)) {
  for (const year of readdirSync(logRoot).filter((f) => /^\d{4}$/.test(f))) {
    for (const f of readdirSync(join(logRoot, year))) {
      const m = /^(\d{4}-\d{2}-\d{2})\.md$/.exec(f);
      if (m) logFiles.push({ date: m[1], path: join(logRoot, year, f) });
    }
  }
}
logFiles.sort((a, b) => a.date.localeCompare(b.date));
const todayIso = iso(today);
const todayLog = logFiles.find((l) => l.date === todayIso) || null;
const earlier = logFiles.filter((l) => l.date < todayIso);
const lastLog = earlier.length ? earlier[earlier.length - 1] : null;

const sections = (text) => {
  const out = {};
  let current = null;
  for (const line of text.split('\n')) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) { current = h[1].trim(); out[current] = []; continue; }
    if (current) out[current].push(line);
  }
  return out;
};
const num = (lines, re) => { for (const l of lines) { const m = re.exec(l); if (m) return Number(m[1]); } return null; };
const str = (lines, re) => { for (const l of lines) { const m = re.exec(l); if (m) return m[1].trim(); } return null; };

const teams = {};
for (const t of config.teams) teams[t.id] = { name: t.name, lastIncidents: null, daysAtZero: 0, lastDelivery: null, draftedToday: false, lastLogged: null };

if (lastLog) {
  const secs = sections(readFileSync(lastLog.path, 'utf8'));
  for (const t of config.teams) {
    const lines = secs[t.name];
    if (!lines) continue;
    teams[t.id].lastLogged = lastLog.date;
    teams[t.id].lastIncidents = num(lines, /(\d+)\s+open/i);
    teams[t.id].daysAtZero = num(lines, /days at zero:\s*(\d+)/i) ?? 0;
    teams[t.id].lastDelivery = str(lines, /Delivery:\s*(posted|draft|held|skipped)/i);
  }
}
if (todayLog) {
  const secs = sections(readFileSync(todayLog.path, 'utf8'));
  for (const t of config.teams) {
    const lines = secs[t.name];
    if (lines && /Delivery:\s*draft/i.test(lines.join('\n'))) teams[t.id].draftedToday = true;
  }
}

// Thought lines used in the last twenty logs, newest first, so today's line can avoid them.
const recentThoughts = [];
for (const l of [...earlier].reverse().slice(0, 20)) {
  for (const m of readFileSync(l.path, 'utf8').matchAll(/Thought:\s*["“]([^"”]+)["”]/g)) recentThoughts.push(m[1].trim());
}

const out = {
  today: todayIso,
  label: dayLabel(today),
  weekday: WEEKDAY[weekday(today)],
  workingDay: isWorkingDay(today),
  holiday: holidayOf(today),
  previousWorkingDay: iso(prev),
  lookbackDays,
  jqlAfter: `-${lookbackDays}d`,
  alreadyRanToday: Boolean(todayLog),
  todayLogPath: join(logRoot, todayIso.slice(0, 4), `${todayIso}.md`),
  lastLog: lastLog ? { date: lastLog.date, path: lastLog.path } : null,
  vault: VAULT,
  vaultFound: existsSync(VAULT),
  teams,
  recentThoughts: [...new Set(recentThoughts)],
};
process.stdout.write(JSON.stringify(out, null, flags.pretty ? 2 : 0) + '\n');
