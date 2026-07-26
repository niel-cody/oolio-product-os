import Link from "next/link";
import os from "@/data/os.json";
import { Button } from "@/components/ui/button";

const fill = (s: string) => s.replaceAll("{skills}", String(os.totals.skills));

export default function HomePage() {
  const a = os.about;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
      <div className="eyebrow">What this is</div>
      <h1 className="mt-3 text-[26px] font-bold leading-[1.3] tracking-tight sm:text-[34px] sm:leading-[1.28]">
        {fill(a.kicker)}
      </h1>

      {a.lede.map((p: string) => (
        <p key={p} className="mt-5 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
          {fill(p)}
        </p>
      ))}

      <div className="mt-9 flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-10">
          <Link href="/map">See the map</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-10">
          <Link href="/skills">Browse {os.totals.skills} skills</Link>
        </Button>
      </div>

      {a.sections.map((s: { label: string; paragraphs?: string[]; list?: string[] }) => (
        <section key={s.label} className="mt-14">
          <div className="eyebrow">{s.label}</div>
          {s.paragraphs?.map((p) => (
            <p key={p} className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
              {fill(p)}
            </p>
          ))}
          {s.list && (
            <ul className="mt-4 space-y-2.5">
              {s.list.map((li) => (
                <li key={li} className="relative pl-4 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
                  <span className="absolute left-0 top-[10px] h-[5px] w-[5px] rounded-sm bg-[var(--orch)]" />
                  {fill(li)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="mt-16 border-t border-[var(--line)] pt-9">
        <p className="text-[28px] font-bold tracking-tight sm:text-[34px]">{a.line}</p>
        <p className="mono mt-3 text-[10px] leading-relaxed text-[var(--muted-ink)]">{fill(a.footnote)}</p>
      </section>

      <section className="mt-16">
        <div className="eyebrow">Install it</div>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)]">
          In Claude Code, add the marketplace and install the plugin. You get updates automatically,
          because it is versioned by commit rather than by a number someone has to remember to bump.
        </p>
        <pre className="mono mt-4 overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 text-[12px] leading-relaxed text-[#c3ccdb]">
{`/plugin marketplace add oolio-group/oolio-product-os
/plugin install oolio-pm@oolio-product-os`}
        </pre>
        <p className="mt-4 text-[14px] leading-relaxed text-[var(--muted-ink)]">
          In Cowork: Settings → Plugins → Add plugin → GitHub, then{" "}
          <span className="mono text-[12px] text-[#c3ccdb]">oolio-group/oolio-product-os</span>.
        </p>
      </section>
    </main>
  );
}
