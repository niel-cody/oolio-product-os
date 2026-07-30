/**
 * The snapshot contract, mirroring `dashboard.schema.json`.
 *
 * The schema is the authority at runtime (see `snapshot.ts`); these types are the authority
 * at compile time. If you change one, change the other, or the renderer will typecheck
 * against a shape the validator rejects.
 */

export type Domain =
  | "insights"
  | "products-app"
  | "inventory"
  | "customer-engagement"
  | "core-pos"
  | "kiosk"
  | "payments"
  | "leadership";

export type StatusLevel = "critical" | "serious" | "warning" | "good";
export type EventKind = "standup" | "meeting" | "focus" | "travel" | "deadline";
export type ItemKind = "decision" | "ask" | "deadline" | "signal";
export type SourceName =
  | "outlook_calendar"
  | "outlook_mail"
  | "teams"
  | "slack"
  | "granola"
  | "jira"
  | "confluence"
  | "hubspot";

export interface SourceHealth {
  ok: boolean;
  items?: number;
  error?: string;
  last_ok: string | null;
}

export interface DayEvent {
  id: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  title: string;
  domain?: Domain | null;
  kind: EventKind;
  attending?: "yes" | "tentative" | "no" | null;
  organiser?: boolean;
}

export interface Act {
  range: string;
  text: string;
}

export interface ItemStatus {
  level: StatusLevel;
  label: string;
}

/** Why the ranker placed an item where it did. Kept so a bad ranking is diagnosable. */
export interface ItemSignals {
  blocks_a_named_person?: boolean;
  window_closes_48h?: boolean;
  direct_to_niel?: boolean;
  mission_weight?: number;
  unanswered_over_48h?: boolean;
  recurrence?: boolean;
}

export interface Item {
  id: string;
  source: string;
  kind: ItemKind;
  title: string;
  question?: string;
  why: string;
  who_waits?: string[];
  asked_at?: string | null;
  due?: string | null;
  domain?: Domain | null;
  gate_clause?: string | null;
  evidence?: string;
  evidence_url?: string | null;
  status?: ItemStatus | null;
  signals?: ItemSignals;
  promote_to?: string | null;
  score?: number;
}

export interface Panel {
  cap: number;
  considered: number;
  items: Item[];
}

export interface ShippedGroup {
  domain: Domain | "cancelled" | string;
  label: string;
  count: number;
  count_label: string;
  text: string;
}

export interface ShippedPanel {
  cap: number;
  considered: number;
  window_days: number;
  groups: ShippedGroup[];
}

export interface TrajectoryRow {
  id: string;
  horizon: "week" | "month" | "quarter" | "year";
  period: string;
  statement: string;
  measure?: string | null;
  target?: number | null;
  current?: number | null;
  progress?: number | null;
  state: "on-track" | "at-risk" | "off-track" | "unmeasured";
  note?: string;
}

export interface DebtRow {
  id: string;
  count: number;
  text: string;
  query?: string | null;
}

export interface GapRow {
  level: StatusLevel;
  source: string;
  text: string;
}

export interface Snapshot {
  schema_version: string;
  generated_at: string;
  for_date: string;
  timezone: string;
  run: {
    connector_calls: number;
    duration_ms: number;
    sources: Partial<Record<SourceName, SourceHealth>>;
  };
  headline: { text: string; anchor_item_id?: string | null };
  day: {
    load: "LIGHT" | "MODERATE" | "HEAVY" | "PUNISHING" | string;
    booked_minutes: number;
    standup_count: number;
    free_minutes: number;
    window: { start: string; end: string };
    events: DayEvent[];
    acts: Act[];
  };
  panels: {
    decide: Panel;
    blocked: Panel;
    at_risk: Panel;
    shipped: ShippedPanel;
    signals: Panel;
  };
  trajectory: TrajectoryRow[];
  debt: DebtRow[];
  gaps: GapRow[];
}
