"use client";

import { useRef, useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addMember } from "@/app/admin/actions";
import { ROLES, ROLE_LABEL } from "@/lib/roles";

/**
 * Adding somebody to the list.
 *
 * Defaults to viewer, which is the least it can grant. A form whose default is the most
 * powerful option gets used carelessly, and the cost of under-granting is one more click
 * while the cost of over-granting is somebody reading a diary that is not theirs.
 */
export function AddMemberForm() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd) =>
        start(async () => {
          const result = await addMember(fd);
          if (result.ok) {
            setMessage({ ok: true, text: `Added ${String(fd.get("email") ?? "").trim()}.` });
            formRef.current?.reset();
          } else {
            setMessage({ ok: false, text: result.message });
          }
        })
      }
      className="rounded-xl border border-[var(--line)] bg-[#09101a] p-4 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_150px_auto] sm:items-end">
        <label className="block">
          <span className="eyebrow">Oolio email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="them@oolio.com"
            className="mono mt-1.5 w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted-ink)]/60 focus:border-[var(--primary)]"
          />
        </label>

        <label className="block">
          <span className="eyebrow">Name (optional)</span>
          <input
            name="full_name"
            type="text"
            placeholder="Their name"
            className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted-ink)]/60 focus:border-[var(--primary)]"
          />
        </label>

        <label className="block">
          <span className="eyebrow">Role</span>
          <select
            name="role"
            defaultValue="viewer"
            className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--primary)]"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" disabled={pending} className="h-9 px-4 text-[13px]">
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          {pending ? "Adding…" : "Add"}
        </Button>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-3 text-[12.5px] leading-relaxed ${
            message.ok ? "text-[var(--output)]" : "text-[var(--destructive)]"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
