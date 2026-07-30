import Link from "next/link";
import os from "@/data/os.json";
import { Button } from "@/components/ui/button";
import { LandingMap } from "@/components/landing-map";
import { getSignedIn } from "@/lib/session";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const fill = (s: string) => s.replaceAll("{skills}", String(os.totals.skills));

/**
 * The public front door, and the only page a signed-out visitor can reach.
 *
 * Everything real lives behind the gate (see lib/routes.ts), so this page has one job:
 * explain what this is well enough that the sign-in button makes sense, without becoming a
 * summary of the material it is protecting. The copy is the site's own, cut down; the map is
 * an outline rather than the map.
 *
 * Signed-in visitors get a different top: their way back in, rather than a pitch they have
 * already accepted.
 */
export default async function HomePage() {
  const a = os.about;

  const signedIn = await getSignedIn();

  const honest = a.sections.find((s) => s.label === "What keeps it honest");

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
      <div className="eyebrow">Oolio Product OS</div>
      <h1 className="mt-3 text-[26px] font-bold leading-[1.3] tracking-tight sm:text-[34px] sm:leading-[1.28]">
        {fill(a.kicker)}
      </h1>

      {a.lede.map((p: string) => (
        <p key={p} className="mt-5 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
          {fill(p)}
        </p>
      ))}

      <div className="mt-9 flex flex-wrap items-center gap-3">
        {signedIn ? (
          <>
            <Button asChild size="lg" className="h-10">
              <Link href="/app/today">
                Open Flightdeck <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-10">
              <Link href="/map">See the full map</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="lg" className="h-10">
              <Link href="/login">
                Sign in <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <span className="text-[13px] leading-relaxed text-[var(--muted-ink)]">
              Oolio teammates only. Access is granted per person.
            </span>
          </>
        )}
      </div>

      <LandingMap />

      <section className="mt-14">
        <div className="eyebrow">Why bother</div>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
          Product work is a small set of moves repeated forever. Turn signal into a shaped idea.
          Pressure-test it honestly. Write it down. Decide. Ship it. Find out whether you were right.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
          Doing those well is not a question of talent. It is a question of discipline, and
          discipline is the first thing to go when the quarter gets loud. Written down, the standard
          stops depending on who is having a good week.
        </p>
      </section>

      <section className="mt-14">
        <div className="eyebrow">The people are the point</div>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
          None of this replaces a product manager. It removes the tax on being one: the blank page,
          the fourth rewrite, the research you know exists somewhere, the ticket nobody groomed, the
          decision relitigated because no one recorded it.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
          What is left is the part that needed a human all along. Judgement. Taste. Knowing which
          problem deserves the company&rsquo;s next quarter.
        </p>
      </section>

      {honest?.list && (
        <section className="mt-14">
          <div className="eyebrow">{honest.label}</div>
          <ul className="mt-4 space-y-2.5">
            {honest.list.map((li) => (
              <li
                key={li}
                className="relative pl-4 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]"
              >
                <span className="absolute left-0 top-[10px] h-[5px] w-[5px] rounded-sm bg-[var(--orch)]" />
                {fill(li)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-16 border-t border-[var(--line)] pt-9">
        <p className="text-[28px] font-bold tracking-tight sm:text-[34px]">{a.line}</p>
        <p className="mono mt-3 text-[10px] leading-relaxed text-[var(--muted-ink)]">
          {fill(a.footnote)}
        </p>
      </section>

      {!signedIn && (
        <section className="mt-14 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-6">
          <div className="text-[15px] font-semibold">The rest is behind sign-in</div>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted-ink)]">
            The live map, all {os.totals.skills} skills and what triggers them, how our tools connect,
            the changelog, and Flightdeck. It is Oolio-internal material, so it is not on the open web.
          </p>
          <Button asChild className="mt-4 h-9">
            <Link href="/login">Sign in with your Oolio address</Link>
          </Button>
        </section>
      )}
    </main>
  );
}
