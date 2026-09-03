import type { Metadata } from "next";
import { WeekGrid } from "@/components/flightdeck/week-grid";
import {
  currentEvent,
  dateRange,
  nextFree,
  planRange,
} from "@/lib/flightdeck/calendar/availability";
import { fetchCalendar, isGraphConfigured } from "@/lib/flightdeck/calendar/source";
import { DEFAULT_WORKING_HOURS } from "@/lib/flightdeck/calendar/types";
import { atLocalTime, clock12, dateKey, duration, startOfDay } from "@/lib/flightdeck/calendar/zone";

export const metadata: Metadata = { title: "Week" };

/**
 * The live calendar.
 *
 * Unlike the dated dashboard, nothing here is a snapshot. Every request re-reads the source
 * and recomputes availability, because a page that answers "when am I free" is worthless the
 * moment it is cached: the meeting that was just booked into your only free afternoon is
 * precisely the one you need it to know about.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TIMEZONE = process.env.FLIGHTDECK_TIMEZONE || "Australia/Melbourne";
const DAYS = 7;

/**
 * How each source is badged. Three words, because the difference between them is the only
 * thing that tells you how much to trust the gaps: LIVE was read this second, SYNCED is as
 * good as the collector's last run, CACHED is a local file that nothing refreshes.
 */
const SOURCE = {
  graph: { label: "LIVE", level: "good" as const },
  supabase: { label: "SYNCED", level: "good" as const },
  cache: { label: "CACHED", level: "warning" as const },
};

function relativeDay(date: string, todayKey: string, timeZone: string): string {
  if (date === todayKey) return "today";
  const at = atLocalTime(date, 12, 0, timeZone);
  const todayAt = atLocalTime(todayKey, 12, 0, timeZone);
  const days = Math.round((at - todayAt) / 86_400_000);
  if (days === 1) return "tomorrow";
  return new Intl.DateTimeFormat("en-AU", { weekday: "long", timeZone }).format(at);
}

export default async function WeekPage() {
  const nowMs = Date.now();
  const todayKey = dateKey(nowMs, TIMEZONE);
  const fromMs = startOfDay(nowMs, TIMEZONE);
  const dates = dateRange(fromMs, DAYS, TIMEZONE);
  const toMs = atLocalTime(dates[dates.length - 1], 0, 0, TIMEZONE) + 24 * 60 * 60_000;

  const { events, provenance } = await fetchCalendar(fromMs, toMs);
  const plans = planRange(dates, events, TIMEZONE, DEFAULT_WORKING_HOURS);

  const now = currentEvent(plans, nowMs);
  const next = nextFree(plans, nowMs);
  const workdays = plans.filter((p) => p.isWorkday);
  const totalFree = workdays.reduce((sum, p) => sum + p.freeMinutes, 0);
  const totalBooked = workdays.reduce((sum, p) => sum + p.bookedMinutes, 0);
  const deepWindows = workdays.flatMap((p) => p.free.filter((w) => w.grade === "deep"));

  const failed = Boolean(provenance.error);
  const ageMinutes = provenance.fetchedAtMs
    ? Math.round((nowMs - provenance.fetchedAtMs) / 60_000)
    : null;

  return (
    <div className="fd-wrap">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="eyebrow">
            Next {DAYS} days · {TIMEZONE.split("/").pop()?.replace(/_/g, " ")}
          </div>
          <h1 className="display mt-2 text-[24px] leading-[1.22] tracking-[-0.014em] sm:text-[29px]">
            {failed
              ? "The calendar could not be read"
              : next
                ? next.date === todayKey && next.window.startMs <= nowMs + 60_000
                  ? `You are free now, for ${duration(next.window.minutes)}.`
                  : `Next free ${relativeDay(next.date, todayKey, TIMEZONE)} at ${clock12(next.window.startMs, TIMEZONE)}, for ${duration(next.window.minutes)}.`
                : "No usable gap in the next seven working days."}
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--fd-ink-2)]">
            {now ? (
              <>
                In <b className="text-[var(--fd-ink)]">{now.title}</b> until{" "}
                {clock12(now.endMs, TIMEZONE)}.{" "}
              </>
            ) : null}
            {!failed && (
              <>
                {duration(totalBooked)} booked and {duration(totalFree)} free across{" "}
                {workdays.length} working days, in {deepWindows.length} stretch
                {deepWindows.length === 1 ? "" : "es"} of 90 minutes or more.
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <span className="fd-stat" data-level={failed ? "critical" : SOURCE[provenance.source].level}>
            {SOURCE[provenance.source].label}
          </span>
          <span className="fd-cap">
            {failed
              ? provenance.error
              : ageMinutes === null
                ? "age unknown"
                : ageMinutes < 2
                  ? "read just now"
                  : `read ${duration(ageMinutes)} ago`}
          </span>
        </div>
      </header>

      {failed && !isGraphConfigured() && (
        <div className="fd-card mt-5 p-4">
          <h2 className="fd-h2">Nothing has collected your diary yet</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--fd-ink-2)]">
            Every source was tried and none answered. The collector is the one expected to be
            running today: a scheduled task on a Mac that reads Outlook through the Microsoft
            connector and writes to Supabase. Run it once by hand to fill the store, or check
            that the scheduled task is still enabled.
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--fd-ink-2)]">
            Setting the four <code className="mono">GRAPH_*</code> variables takes precedence
            over all of it and reads Outlook directly, per request. See{" "}
            <code className="mono">site/README.md</code>.
          </p>
        </div>
      )}

      {!failed && (
        <>
          <section className="mt-6">
            <WeekGrid plans={plans} timeZone={TIMEZONE} nowMs={nowMs} />
          </section>

          <section className="mt-7">
            <h2 className="fd-h2">Where the room is</h2>
            <p className="fd-cap mt-1 mb-3">
              Gaps of {DEFAULT_WORKING_HOURS.start} to {DEFAULT_WORKING_HOURS.end} only, and only
              those long enough to hold something. Anything under 25 minutes is not offered.
            </p>
            <ul className="fdw-list">
              {workdays.map((plan) => {
                // A gap that has already been and gone is not room, it is history. Today is
                // the only day this applies to, and it is the day you are actually planning.
                const ahead = plan.free.filter((w) => w.endMs > nowMs);
                const spent = plan.free.length - ahead.length;
                return (
                  <li key={plan.date}>
                    <div className="fdw-list-day">
                      <span className="fdw-list-name">
                        {relativeDay(plan.date, todayKey, TIMEZONE)}
                      </span>
                      <span className="fd-cap">
                        {plan.busy.length} meeting{plan.busy.length === 1 ? "" : "s"} ·{" "}
                        {plan.load.toLowerCase()}
                        {plan.longestRunMinutes >= 150 &&
                          ` · ${duration(plan.longestRunMinutes)} unbroken`}
                        {spent > 0 && ` · ${spent} gap${spent === 1 ? "" : "s"} already gone`}
                      </span>
                    </div>
                    <div className="fdw-chips">
                      {ahead.length === 0 ? (
                        <span className="fd-tag">nothing left</span>
                      ) : (
                        ahead.map((w) => (
                          <span key={w.startMs} className="fdw-chip" data-grade={w.grade}>
                            {clock12(w.startMs, TIMEZONE)}–{clock12(w.endMs, TIMEZONE)}
                            <b>{duration(w.minutes)}</b>
                          </span>
                        ))
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
