import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMember, listMembers } from "@/lib/members";
import { ROLE_BLURB, ROLE_LABEL, ROLES } from "@/lib/roles";
import { MembersTable, RoleTag } from "@/components/members-table";
import { AddMemberForm } from "@/components/add-member-form";

export const metadata: Metadata = { title: "Members" };
export const dynamic = "force-dynamic";

/**
 * Who can use the Product OS, and as what.
 *
 * The middleware already refuses this route to anyone below admin, so the guard below is
 * belt and braces rather than the boundary. It is cheap, though, and a page that renders the
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
      <h1 className="page-title mt-3">Members</h1>
      <p className="page-lede mt-5">
        Access is the presence of a row. Someone not on this list cannot sign in at all, and
        an empty list would lock everybody out rather than letting everybody in. Add people
        before they first try to sign in; the account itself is created when they follow
        their magic link.
      </p>

      {/* The tally, as static chips: a count is a thing you read, not a thing you press. */}
      <dl className="mt-6 flex flex-wrap items-center gap-2">
        {counts.map(([role, n]) => (
          <div key={role} className="chip chip-static">
            <dt className="sr-only">{ROLE_LABEL[role]}</dt>
            <dd className="flex items-baseline gap-1.5">
              <span className="tabular-nums text-[var(--ink)]">{n}</span>
              <span className="n">
                {ROLE_LABEL[role].toLowerCase()}
                {n === 1 ? "" : "s"}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <h2 className="t-display-m">What each role can do</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {ROLES.map((role) => (
            <li key={role} className="surface p-5">
              <RoleTag role={role} />
              <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--soft-ink)]">
                {ROLE_BLURB[role]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="t-display-m">Add someone</h2>
        <div className="mt-4">
          <AddMemberForm />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="t-display-m">
          On the list <span className="mono text-[12px] text-[var(--muted-ink)]">{members.length}</span>
        </h2>
        <div className="mt-4">
          <MembersTable members={members} meEmail={me.email} />
        </div>
      </section>
    </main>
  );
}
