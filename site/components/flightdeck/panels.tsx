import type {
  Item,
  Panel,
  ShippedPanel,
  TrajectoryRow,
  DebtRow,
  GapRow,
} from "@/lib/flightdeck/types";
import { CardHeader, DomainTag, Stat, Tag, domainColour } from "./atoms";

/**
 * Splits the "why" so the evidence clause can be marked up as the source it is.
 *
 * The prototype hand-wrote a <span class="src"> around the citation in every item. The
 * snapshot carries `evidence` as its own field, so we find that substring and mark it,
 * which keeps citations visually consistent without the collector having to emit HTML.
 */
function Why({ item }: { item: Item }) {
  const { why, evidence, evidence_url } = item;
  if (!evidence || !why.includes(evidence)) {
    return <p className="fd-why">{why}</p>;
  }
  const [before, ...rest] = why.split(evidence);
  const after = rest.join(evidence);
  const cite = evidence_url ? (
    <a href={evidence_url} target="_blank" rel="noreferrer" className="fd-src">
      {evidence}
    </a>
  ) : (
    <span className="fd-src">{evidence}</span>
  );
  return (
    <p className="fd-why">
      {before}
      {cite}
      {after}
    </p>
  );
}

/** Human-readable reasons this item ranked where it did, from the `signals` object. */
function rankReasons(item: Item): string[] {
  const s = item.signals;
  if (!s) return [];
  const out: string[] = [];
  if (s.blocks_a_named_person) out.push("blocks a named person");
  if (s.window_closes_48h) out.push("window closes inside 48h");
  if (s.direct_to_niel) out.push("asked of you directly");
  if (s.unanswered_over_48h) out.push("unanswered over 48h");
  if (s.recurrence) out.push("has come up before");
  if (typeof s.mission_weight === "number") out.push(`mission weight ${s.mission_weight}`);
  return out;
}

function ItemRow({ item }: { item: Item }) {
  const reasons = rankReasons(item);
  return (
    <li>
      <span className="fd-ttl">
        {item.evidence_url && !item.evidence ? (
          <a href={item.evidence_url} target="_blank" rel="noreferrer">
            {item.title}
          </a>
        ) : (
          item.title
        )}
      </span>
      <Why item={item} />
      <div className="fd-meta">
        {item.status && <Stat level={item.status.level}>{item.status.label}</Stat>}
        <DomainTag domain={item.domain} />
        {item.who_waits?.length ? <Tag>{item.who_waits.join(", ")} waiting</Tag> : null}
      </div>
      {/* The ranking is the risky part of this product (V1 spec §5). Surfacing why an item
          scored where it did is what makes a wrong ranking correctable rather than just
          annoying, and it is collapsed so it costs nothing when you do not care. */}
      {reasons.length > 0 && (
        <details className="fd-why-ranked">
          <summary>Why this ranked here</summary>
          <ul>
            {reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}

export function ItemPanel({
  title,
  sub,
  panel,
}: {
  title: string;
  sub: string;
  panel: Panel;
}) {
  return (
    <section className="fd-card px-[18px] pt-4 pb-1.5">
      <CardHeader
        title={title}
        caption={`${panel.items.length} of ${panel.considered}`}
        sub={sub}
      />
      {panel.items.length === 0 ? (
        <p className="py-3 text-[13px] text-[var(--fd-ink-3)]">Nothing today.</p>
      ) : (
        <ol className="fd-items">
          {panel.items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ol>
      )}
    </section>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "2026-08" is a period identifier, not a label. Dropping the year leaves "08", which reads
 * as a number rather than a month, so months are named. Quarters, weeks and FY labels are
 * already readable once the year is off the front.
 */
function periodLabel(period: string): string {
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.exec(period);
  if (month) return MONTHS[Number(month[1]) - 1];
  return period.replace(/^\d{4}-/, "");
}

export function Trajectory({ rows }: { rows: TrajectoryRow[] }) {
  const unmeasured = rows.filter((r) => r.state === "unmeasured").length;
  return (
    <section className="fd-card mt-4 px-[18px] py-4">
      <CardHeader
        title="Trajectory"
        caption={unmeasured ? `${unmeasured} of ${rows.length} unmeasured` : undefined}
      />
      <table className="fd-tj mt-2">
        <thead>
          <tr>
            <th style={{ width: 108 }}>Horizon</th>
            <th>Goal</th>
            <th style={{ width: 230 }}>Progress</th>
            <th style={{ width: 130, textAlign: "right" }}>State</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const measured = r.state !== "unmeasured" && typeof r.progress === "number";
            return (
              <tr key={r.id}>
                <td className="fd-cap uppercase">
                  {r.horizon} · {periodLabel(r.period)}
                </td>
                <td>{r.statement}</td>
                <td className="md:pr-6">
                  <div className="fd-meter" data-none={!measured}>
                    {measured && (
                      <i
                        style={{
                          width: `${Math.round((r.progress ?? 0) * 100)}%`,
                          background: "var(--primary)",
                        }}
                      />
                    )}
                  </div>
                  {r.note && <div className="fd-mnote">{r.note}</div>}
                </td>
                <td className="md:text-right">
                  <Stat level={r.state === "on-track" ? "good" : r.state === "unmeasured" ? "none" : "warning"}>
                    {r.state === "on-track"
                      ? "On track"
                      : r.state === "unmeasured"
                        ? "Unmeasured"
                        : r.state === "at-risk"
                          ? "At risk"
                          : "Off track"}
                  </Stat>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export function Shipped({ panel }: { panel: ShippedPanel }) {
  return (
    <section className="fd-card mt-4 px-[18px] py-4">
      <CardHeader
        title="Shipped"
        caption={`${panel.considered} closed in ${panel.window_days} days · ${panel.groups.length} groups`}
      />
      <div className="mt-1 grid gap-x-7 sm:grid-cols-2">
        {panel.groups.map((g, i) => (
          <div
            key={g.domain + g.label}
            className={
              i < 2
                ? "py-2.5 sm:border-t-0"
                : "border-t border-[var(--fd-hair)] py-2.5"
            }
          >
            <div className="flex items-center gap-2 text-[12.5px] font-semibold">
              <span className="fd-dot" style={{ background: domainColour(g.domain) }} />
              {g.label}
              <span className="fd-cap ml-auto">{g.count_label}</span>
            </div>
            <p className="mt-0.5 text-[12.5px] text-[var(--fd-ink-2)]">{g.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Signals({ panel }: { panel: Panel }) {
  return (
    <section className="fd-card mt-4 px-[18px] pt-4 pb-1.5">
      <CardHeader
        title="Signals"
        caption={`${panel.items.length} of ${panel.considered}`}
        sub="What a team worked out, that changes what you understand."
      />
      <ol className="fd-items">
        {panel.items.map((item) => (
          <li key={item.id}>
            <span className="fd-ttl">{item.title}</span>
            <Why item={item} />
            {(item.domain || item.promote_to) && (
              <div className="fd-meta">
                <DomainTag domain={item.domain} />
                {item.promote_to && <Tag>File in {item.promote_to}</Tag>}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Footer({ debt, gaps }: { debt: DebtRow[]; gaps: GapRow[] }) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="fd-card px-[18px] py-4">
        <CardHeader title="Debt" caption="Suppressed on purpose" />
        <div className="mt-1 space-y-2">
          {debt.map((d) => (
            <p key={d.id} className="text-[12.5px] leading-relaxed text-[var(--fd-ink-2)]">
              <b className="text-[var(--fd-ink)]">{d.count.toLocaleString("en-AU")}</b> {d.text}
            </p>
          ))}
        </div>
      </section>
      <section className="fd-card px-[18px] py-4">
        <CardHeader title="Gaps" caption="Sources" />
        <div className="mt-1 space-y-2">
          {gaps.map((g) => (
            <p
              key={g.source + g.text}
              className="flex gap-2 text-[12.5px] leading-relaxed text-[var(--fd-ink-2)]"
            >
              <Stat level={g.level}>{""}</Stat>
              <span>
                <b className="text-[var(--fd-ink)]">{g.source}</b> {g.text}
              </span>
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
