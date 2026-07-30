import type { Domain, StatusLevel } from "@/lib/flightdeck/types";

const DOMAIN_LABEL: Record<string, string> = {
  insights: "Insights",
  "products-app": "Products App",
  inventory: "Inventory",
  "customer-engagement": "Customer Engagement",
  "core-pos": "Core POS",
  kiosk: "Kiosk",
  payments: "Payments",
  leadership: "Leadership",
  cancelled: "Cancelled",
};

export function domainLabel(domain?: string | null): string {
  if (!domain) return "";
  return DOMAIN_LABEL[domain] ?? domain;
}

/** Every domain colour comes from a CSS variable, so both themes are handled in one place. */
export function domainColour(domain?: string | null): string {
  if (!domain || domain === "cancelled") return "var(--fd-d-none)";
  return `var(--fd-d-${domain}, var(--fd-d-none))`;
}

export function DomainTag({ domain }: { domain?: string | null }) {
  if (!domain) return null;
  return (
    <span className="fd-tag">
      <span className="fd-dot" style={{ background: domainColour(domain) }} />
      {domainLabel(domain)}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="fd-tag">{children}</span>;
}

export function Stat({
  level,
  children,
}: {
  level: StatusLevel | "none";
  children: React.ReactNode;
}) {
  return (
    <span className="fd-stat" data-level={level}>
      {level !== "none" && <span aria-hidden>◆</span>}
      {children}
    </span>
  );
}

export function CardHeader({
  title,
  caption,
  sub,
}: {
  title: string;
  caption?: string;
  sub?: string;
}) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="fd-h2">{title}</h2>
        {caption && <span className="fd-cap">{caption}</span>}
      </div>
      {sub && <p className="fd-cap mt-1 mb-2.5">{sub}</p>}
    </>
  );
}

export type { Domain };
