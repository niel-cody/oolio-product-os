"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removeMember, setRole } from "@/app/admin/actions";
import { ROLES, ROLE_LABEL, type Role } from "@/lib/roles";
import type { Member } from "@/lib/members";

const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : "never";

/**
 * The list, with the two changes an admin actually makes: what somebody's role is, and
 * whether they are on it at all.
 *
 * Both write through server actions that re-check the caller, and both can be refused by the
 * database — demoting or removing the last admin raises rather than locking the team out —
 * so the failure path here shows the reason instead of silently doing nothing.
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
      <p className="rounded-xl border border-[var(--line)] bg-[#cfccc6] p-5 text-[13.5px] text-[var(--muted-ink)]">
        Nobody is on the list, which means nobody can sign in. Add yourself first.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-md border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 px-3 py-2 text-[12.5px] leading-relaxed text-[var(--ink)]"
        >
          {error}
        </p>
      )}

      <ul className="grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)]">
        {members.map((m) => {
          const isMe = m.email === meEmail;
          const rowBusy = pending && busy === m.email;
          return (
            <li
              key={m.email}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-[#cfccc6] px-4 py-3"
              style={rowBusy ? { opacity: 0.55 } : undefined}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="mono truncate text-[13px] text-[var(--ink)]">{m.email}</span>
                  {isMe && <span className="eyebrow shrink-0">you</span>}
                </div>
                <div className="mt-0.5 text-[11.5px] text-[var(--muted-ink)]">
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
                  className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-[12.5px] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
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
                className="lx-press shrink-0 rounded-md border border-[var(--line)] p-2 text-[var(--muted-ink)] hover:border-[var(--destructive)]/50 hover:text-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={`Remove ${m.email}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
