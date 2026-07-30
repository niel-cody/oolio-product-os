/** No snapshot exists yet. Reachable before the collector's first run (M3). */
export default function NoSnapshotPage() {
  return (
    <div className="fd-wrap max-w-[680px]">
      <div className="eyebrow">Flightdeck</div>
      <h1 className="mt-2 text-[22px] font-semibold">No snapshot yet</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-[var(--fd-ink-2)]">
        Nothing has been collected. The scheduled collector lands at 05:30 on weekdays; until
        it runs for the first time there is no day to show.
      </p>
    </div>
  );
}
