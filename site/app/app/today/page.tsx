import { redirect } from "next/navigation";
import { latestSnapshotDate } from "@/lib/flightdeck/snapshot";

export const dynamic = "force-dynamic";

/**
 * The landing page after sign-in.
 *
 * Resolves to whichever snapshot is newest and hands off to the dated route, so there is
 * exactly one renderer and `/app/today` stays a stable bookmark.
 */
export default async function TodayPage() {
  const date = await latestSnapshotDate();
  if (!date) redirect("/app/none");
  redirect(`/app/d/${date}`);
}
