import os from "@/data/os.json";
import { getSky } from "@/lib/landing-sky";
import { getSignedIn } from "@/lib/session";
import { LandingExperience } from "@/components/landing-experience";

export const dynamic = "force-dynamic";

/**
 * The public front door. Deliberately thin: the cinematic experience lives in
 * components/landing-experience.tsx, and the essay that used to be here lives at /about,
 * behind the gate, where a signed-in reader has the context to want it.
 *
 * Everything handed to the client component is either curated (the sky) or a count.
 */
export default async function HomePage() {
  const signedIn = await getSignedIn();

  return (
    <LandingExperience
      sky={getSky()}
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
