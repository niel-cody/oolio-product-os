import type { Snapshot } from "@/lib/flightdeck/types";
import { DayBar } from "./day-bar";
import { Footer, ItemPanel, Shipped, Signals, Trajectory } from "./panels";
import { domainColour, domainLabel } from "./atoms";

const LOAD_COLOUR: Record<string, string> = {
  LIGHT: "var(--fd-good)",
  MODERATE: "var(--fd-warn)",
  HEAVY: "var(--fd-serious)",
  PUNISHING: "var(--fd-critical)",
};

function formatDate(iso: string, timeZone: string): string {
  // Noon avoids the date shifting a day either way when the viewer is in another timezone.
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(`${iso}T12:00:00`));
}

function hours(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function Dashboard({ snapshot }: { snapshot: Snapshot }) {
  const { day, panels, headline } = snapshot;
  const city = snapshot.timezone.split("/").pop()?.replace(/_/g, " ") ?? snapshot.timezone;

  // Only domains actually on the page belong in the legend. A fixed legend teaches you to
  // ignore it; one that matches today's content stays worth reading.
  const present = new Set<string>();
  for (const ev of day.events) if (ev.domain) present.add(ev.domain);
  for (const p of [panels.decide, panels.blocked, panels.at_risk, panels.signals])
    for (const it of p.items) if (it.domain) present.add(it.domain);
  for (const g of panels.shipped.groups) if (g.domain && g.domain !== "cancelled") present.add(g.domain);

  const failed = Object.entries(snapshot.run.sources).filter(([, s]) => s && !s.ok);

  return (
    <div className="fd-wrap">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="eyebrow">
            {formatDate(snapshot.for_date, snapshot.timezone)} · {city}
          </div>
          <h1 className="mt-2 max-w-[820px] text-[22px] font-semibold leading-[1.25] tracking-[-0.01em] sm:text-[26px]">
            {headline.text}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="fd-tag" style={{ padding: "5px 12px" }}>
            <span
              className="fd-dot"
              style={{ background: LOAD_COLOUR[day.load] ?? "var(--fd-ink-3)", width: 8, height: 8 }}
            />
            <b className="text-[var(--fd-ink)] tracking-[0.04em]">{day.load}</b>
            <span className="text-[var(--fd-ink-3)]">
              · {hours(day.booked_minutes)} booked · {day.standup_count} standups ·{" "}
              {hours(day.free_minutes)} free
            </span>
          </span>
        </div>
      </header>

      <DayBar day={day} forDate={snapshot.for_date} timeZone={snapshot.timezone} />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ItemPanel
          title="Decide"
          sub="Only you can call it. If you do nothing, it stays stuck."
          panel={panels.decide}
        />
        <ItemPanel
          title="Blocked on me"
          sub="Asked, and not yet answered by you."
          panel={panels.blocked}
        />
        <ItemPanel
          title="At risk"
          sub="Dates that are actually real. Stale ones are in Debt."
          panel={panels.at_risk}
        />
      </div>

      <Trajectory rows={snapshot.trajectory} />
      <Shipped panel={panels.shipped} />
      <Signals panel={panels.signals} />
      <Footer debt={snapshot.debt} gaps={snapshot.gaps} />

      <footer className="mt-5 flex flex-wrap justify-between gap-3 text-[11px] text-[var(--fd-ink-3)]">
        <div className="flex flex-wrap gap-3">
          {[...present].sort().map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5">
              <i className="fd-dot" style={{ background: domainColour(d) }} />
              {domainLabel(d)}
            </span>
          ))}
        </div>
        <div className="fd-cap">
          Built {new Date(snapshot.generated_at).toLocaleString("en-AU", {
            timeZone: snapshot.timezone,
            dateStyle: "medium",
            timeStyle: "short",
          })}{" "}
          · {snapshot.run.connector_calls} connector calls
          {failed.length > 0 && ` · ${failed.length} source${failed.length > 1 ? "s" : ""} down`}
        </div>
      </footer>
    </div>
  );
}
