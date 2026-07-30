import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Dashboard } from "@/components/flightdeck/dashboard";
import { SnapshotInvalid, loadSnapshot } from "@/lib/flightdeck/snapshot";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  return { title: date };
}

export default async function DatedPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  let snapshot;
  try {
    snapshot = await loadSnapshot(date);
  } catch (err) {
    // A snapshot that fails validation is shown as a failure, not hidden behind a 404. The
    // collector is a Claude session, so "the file is there but malformed" is a real outcome
    // and the person needs to know that is what happened.
    if (err instanceof SnapshotInvalid) {
      return (
        <div className="fd-wrap max-w-[760px]">
          <div className="eyebrow">Flightdeck</div>
          <h1 className="mt-2 text-[22px] font-semibold">The snapshot for {date} is malformed</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--fd-ink-2)]">
            It was found, but it does not match the schema, so rendering it would show you a
            partial day and let you believe it was the whole one.
          </p>
          <pre className="mono mt-4 overflow-x-auto rounded-lg border border-[var(--fd-hair)] bg-[var(--fd-surface)] p-4 text-[11.5px] leading-relaxed text-[var(--fd-ink-2)]">
            {err.problems.join("\n")}
          </pre>
        </div>
      );
    }
    throw err;
  }

  if (!snapshot) notFound();
  return <Dashboard snapshot={snapshot} />;
}
