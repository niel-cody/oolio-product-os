import type { Metadata } from "next";
import Link from "next/link";
import os from "@/data/os.json";

export const metadata: Metadata = {
  title: "Systems",
  description: "How Jira, Confluence, HubSpot, PostHog and chat connect. In progress.",
};

export default function SystemsPage() {
  // Every badge on the map names the tools a skill touches. That is the seam the
  // systems map will generate from, rather than being hand-drawn and going stale.
  const connectors = [...new Set(
    os.map.nodes.flatMap((n) => n.badge.split("·")).map((s) => s.trim()).filter(Boolean),
  )].sort();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
      <div className="eyebrow">Next map</div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">How the systems connect</h1>
      <p className="mt-5 text-[15px] leading-relaxed text-[var(--muted-ink)]">
        The map next door shows how the work moves. This one will show what it moves through:
        Jira, Confluence, HubSpot, PostHog and chat, and which skill reads or writes which.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)]">
        It is not built yet, and it is deliberately not hand-drawn. A systems diagram someone
        draws by hand is wrong within a month. Every skill already declares the tools it touches,
        so this will generate from the same source as everything else here.
      </p>

      <div className="eyebrow mt-12">Connectors named by skills today</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {connectors.map((c) => (
          <span
            key={c}
            className="mono rounded-md border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-[10px] tracking-[0.1em] text-[var(--muted-ink)]"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-14 border-t border-[var(--line)] pt-8">
        <Link href="/map" className="text-[14px] text-[var(--orch)] hover:underline">
          See the map that does exist →
        </Link>
      </div>
    </main>
  );
}
