import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMember, listMembers } from "@/lib/members";
import { ROLE_BLURB, ROLE_LABEL, ROLES } from "@/lib/roles";
import { MembersTable } from "@/components/members-table";
import { AddMemberForm } from "@/components/add-member-form";

export const metadata: Metadata = { title: "Members" };
export const dynamic = "force-dynamic";

/**
 * Who can use the Product OS, and as what.
 *
 * The middleware already refuses this route to anyone below admin, so the guard below is
 * belt and braces rather than the boundary — but it is cheap, and a page that renders the
 * whole member list is not one to leave depending on a single matcher entry being right.
 */
export default async function AdminPage() {
  const me = await getMember();
  if (!me || me.role !== "admin") redirect("/login?forbidden=admin");

  const members = await listMembers();
  const counts = ROLES.map((r) => [r, members.filter((m) => m.role === r).length] as const);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="eyebrow">Access</div>
      <h1 className="display mt-3 text-[31px] tracking-[-0.016em] sm:text-[38px]">Members</h1>
      <p className="mt-3 max-w-[640px] text-[14.5px] leading-relaxed text-[var(--muted-ink)]">
        Access is the presence of a row. Someone not on this list cannot sign in at all, and
        an empty list would lock everybody out rather than letting everybody in. Add people
        before they first try to sign in; the account itself is created when they follow
        their magic link.
      </p>

      <dl className="mono mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-[var(--muted-ink)]">
        {counts.map(([role, n]) => (
          <span key={role} className="flex items-baseline gap-1.5">
            <dt className="sr-only">{ROLE_LABEL[role]}</dt>
            <dd className="text-[13px] font-semibold tabular-nums text-[var(--ink)]">{n}</dd>
            <span>{ROLE_LABEL[role].toLowerCase()}{n === 1 ? "" : "s"}</span>
          </span>
        ))}
      </dl>

      <section className="mt-10">
        <h2 className="text-[15px] font-semibold tracking-tight">What each role can do</h2>
        <ul className="mt-3 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
          {ROLES.map((role) => (
            <li key={role} className="bg-[#cfccc6] p-4">
              <div className="text-[13.5px] font-semibold text-[var(--ink)]">
                {ROLE_LABEL[role]}
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted-ink)]">
                {ROLE_BLURB[role]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-[15px] font-semibold tracking-tight">Add someone</h2>
        <div className="mt-3">
          <AddMemberForm />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[15px] font-semibold tracking-tight">
          On the list <span className="mono text-[11px] text-[var(--muted-ink)]">{members.length}</span>
        </h2>
        <div className="mt-3">
          <MembersTable members={members} meEmail={me.email} />
        </div>
      </section>
    </main>
  );
}
