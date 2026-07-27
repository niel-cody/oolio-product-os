import type { Metadata } from "next";
import os from "@/data/os.json";
import { SystemsMap } from "@/components/systems-map";
import "./systems.css";

export const metadata: Metadata = {
  title: "Systems",
  description:
    "How data moves between Oolio's systems: Granola, Slack, Microsoft 365, HubSpot, Apify, " +
    "the web, PostHog and Figma in; Jira, JPD, Confluence and GitHub out; the Brain underneath.",
};

export default function SystemsPage() {
  return <SystemsMap systems={os.systems} stamp={os.stamp} skills={os.totals.skills} />;
}
