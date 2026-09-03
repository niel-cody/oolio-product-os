import os from "@/data/os.json";
import { getFlowRails, getShowcase, getStages } from "@/lib/landing-sky";
import { getSignedIn } from "@/lib/session";
import { LandingExperience } from "@/components/landing-experience";

export const dynamic = "force-dynamic";

/**
 * The public front door. Deliberately thin: the page lives in
 * components/landing-experience.tsx, and the essay that used to be here lives at /about,
 * behind the gate, where a signed-in reader has the context to want it.
 *
 * Everything handed to the client component is curated by lib/landing-sky.ts, which is the
 * single place that decides what the open web is allowed to know. Do not pass os.json
 * through here: it carries every skill's triggers and the whole systems map.
 *
 * getSky() is no longer called. The star chart it fed is gone, and it was the thing that
 * shipped all 32 skill names to the browser as React keys, so the public payload is both
 * smaller and safer without it.
 */
export default async function HomePage() {
  const signedIn = await getSignedIn();

  return (
    <LandingExperience
      stages={getStages()}
      flows={getFlowRails()}
      showcase={getShowcase()}
      signedIn={signedIn}
      counts={{
        skills: os.totals.skills,
        stages: os.map.columns.length,
        flows: os.map.flows.length,
        changes: os.changelog.length,
      }}
    />
  );
}
