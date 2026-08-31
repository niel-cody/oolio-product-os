import os from "@/data/os.json";
import { getFlowRails, getShowcase, getSky, getStages } from "@/lib/landing-sky";
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
 */
export default async function HomePage() {
  const signedIn = await getSignedIn();

  return (
    <LandingExperience
      sky={getSky()}
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
