"use client";

import { useRef, useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addMember } from "@/app/admin/actions";
import { ROLES, ROLE_LABEL } from "@/lib/roles";

/**
 * The same dressing the members table gives its role select, so the two controls that pick
 * a role are the same shape whether they sit in a row or in a form.
 */
const SELECT_CLASS =
  "mt-1.5 h-9 w-full min-w-0 rounded-[var(--r-ctl)] border border-[var(--rule-2)] bg-[var(--stock-2)] px-3 text-[13px] text-[var(--ink)] transition-colors outline-none hover:border-[var(--muted-ink)] focus-visible:border-[var(--blue)] focus-visible:ring-2 focus-visible:ring-[var(--blue)]/30";

/**
 * Adding somebody to the list.
 *
 * Defaults to viewer, which is the least it can grant. A form whose default is the most
 * powerful option gets used carelessly, and the cost of under-granting is one more click
 * while the cost of over-granting is somebody reading a diary that is not theirs.
 *
 * A plain surface, not a folded one: this sheet holds controls, and the fold is for a sheet
 * that holds something.
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
      className="surface p-4 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_150px_auto] sm:items-end">
        <label className="block">
          <span className="eyebrow">Oolio email</span>
          <Input name="email" type="email" required placeholder="them@oolio.com" className="mono mt-1.5 text-[13px]" />
        </label>

        <label className="block">
          <span className="eyebrow">Name (optional)</span>
          <Input name="full_name" type="text" placeholder="Their name" className="mt-1.5 text-[13px]" />
        </label>

        <label className="block">
          <span className="eyebrow">Role</span>
          <select name="role" defaultValue="viewer" className={SELECT_CLASS}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" disabled={pending}>
          <UserPlus data-icon="inline-start" />
          {pending ? "Adding…" : "Add"}
        </Button>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-3 text-[13px] leading-relaxed ${
            message.ok ? "text-[var(--soft-ink)]" : "text-[var(--alarm)]"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
