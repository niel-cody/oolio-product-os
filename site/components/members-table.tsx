"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeMember, setRole } from "@/app/admin/actions";
import { ROLES, ROLE_LABEL, type Role } from "@/lib/roles";
import type { Member } from "@/lib/members";

const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : "never";

/**
 * The role as a tag. Blue for admin because blue carries structure, green for user because
 * it is the ordinary passing state, and the plain sheet for viewer. Never yellow: nobody is
 * deciding anything here.
 */
const ROLE_TAG: Record<Role, string> = {
  admin: "tag tag-blue",
  user: "tag tag-green",
  viewer: "tag",
};

export function RoleTag({ role }: { role: Role }) {
  return <span className={ROLE_TAG[role]}>{ROLE_LABEL[role]}</span>;
}

/**
 * The native select, dressed as the one text field. A native control because the role
 * ladder is three words long and a custom menu would be ceremony; styled as an Input so it
 * sits in the row at the same height and radius as everything else that can be pressed.
 */
const SELECT_CLASS =
  "h-9 min-w-0 rounded-[var(--r-ctl)] border border-[var(--rule-2)] bg-[var(--stock-2)] px-3 text-[13px] text-[var(--ink)] transition-colors outline-none hover:border-[var(--muted-ink)] focus-visible:border-[var(--blue)] focus-visible:ring-2 focus-visible:ring-[var(--blue)]/30 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * The list, with the two changes an admin actually makes: what somebody's role is, and
 * whether they are on it at all.
 *
 * Both write through server actions that re-check the caller, and both can be refused by the
 * database (demoting or removing the last admin raises rather than locking the team out), so
 * the failure path here shows the reason instead of silently doing nothing.
 */
export function MembersTable({ members, meEmail }: { members: Member[]; meEmail: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const run = (email: string, fn: () => Promise<{ ok: boolean; message?: string }>) => {
    setBusy(email);
    setError(null);
    start(async () => {
      const result = await fn();
      if (!result.ok) setError(result.message ?? "That did not work.");
      setBusy(null);
    });
  };

  if (members.length === 0) {
    return (
      <p className="surface p-5 text-[13.5px] text-[var(--muted-ink)]">
        Nobody is on the list, which means nobody can sign in. Add yourself first.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="surface mb-3 bg-[color-mix(in_oklab,var(--alarm)_10%,var(--stock-2))] px-4 py-3 text-[13px] leading-relaxed text-[var(--ink)]"
        >
          {error}
        </p>
      )}

      <div className="surface overflow-hidden">
        {/* The header row only earns its space once the row is wide enough to be columns. */}
        <div className="hidden border-b border-[var(--rule)] px-4 py-2.5 sm:grid sm:grid-cols-[minmax(0,1fr)_150px_32px] sm:gap-x-4">
          <span className="eyebrow">Member</span>
          <span className="eyebrow">Role</span>
          <span className="sr-only">Remove</span>
        </div>

        <ul>
          {members.map((m) => {
            const isMe = m.email === meEmail;
            const rowBusy = pending && busy === m.email;
            return (
              <li
                key={m.email}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--rule)] px-4 py-3 transition-opacity duration-[var(--dur-state)] ease-[var(--ease-out)] first:border-t-0 sm:grid sm:grid-cols-[minmax(0,1fr)_150px_32px]"
                style={rowBusy ? { opacity: 0.55 } : undefined}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="mono truncate text-[13px] text-[var(--ink)]">{m.email}</span>
                    {isMe && <span className="tag shrink-0">you</span>}
                  </div>
                  <div className="mt-0.5 text-[12px] text-[var(--muted-ink)]">
                    {m.fullName ? `${m.fullName} · ` : ""}
                    {m.linked ? `last seen ${when(m.lastSeenAt)}` : "never signed in"}
                    {m.invitedBy ? ` · added by ${m.invitedBy}` : ""}
                  </div>
                </div>

                <label className="shrink-0">
                  <span className="sr-only">Role for {m.email}</span>
                  <select
                    value={m.role}
                    disabled={rowBusy}
                    onChange={(e) => {
                      const next = e.target.value as Role;
                      const fd = new FormData();
                      fd.set("email", m.email);
                      fd.set("role", next);
                      run(m.email, () => setRole(fd));
                    }}
                    className={`${SELECT_CLASS} w-full`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </label>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={rowBusy || isMe}
                  title={isMe ? "You cannot remove yourself" : `Remove ${m.email}`}
                  onClick={() => {
                    // Removing somebody ends their access on their next request. Cheap to undo
                    // by adding them back, but not something to do on a stray click.
                    if (!confirm(`Remove ${m.email}? They will lose access immediately.`)) return;
                    const fd = new FormData();
                    fd.set("email", m.email);
                    run(m.email, () => removeMember(fd));
                  }}
                  className="shrink-0 text-[var(--muted-ink)] hover:text-[var(--alarm)]"
                  aria-label={`Remove ${m.email}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
