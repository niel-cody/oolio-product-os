import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isRole, type Role } from "@/lib/roles";

/**
 * Who someone is, and what that lets them do.
 *
 * Membership lives in the `members` table in Supabase, keyed by email, and replaces the
 * FLIGHTDECK_ALLOWED_EMAILS environment variable. Access used to be a Vercel edit and a
 * redeploy, with nowhere to record what a person was allowed to do beyond in or out.
 *
 * The property worth protecting from the old design is that it failed closed. It still
 * does, in the same way and for the same reason: access is the presence of a row, so a
 * missing row, an empty table, a failed query and an unknown role all come out as no
 * access rather than as full access.
 */

export type { Role } from "@/lib/roles";

export type Member = {
  email: string;
  role: Role;
  fullName: string | null;
  note: string | null;
  invitedBy: string | null;
  createdAt: string;
  lastSeenAt: string | null;
  linked: boolean;
};

type Row = {
  email: string;
  role: string;
  full_name: string | null;
  note: string | null;
  invited_by: string | null;
  created_at: string;
  last_seen_at: string | null;
  user_id: string | null;
};

const toMember = (r: Row): Member | null =>
  isRole(r.role)
    ? {
        email: r.email,
        role: r.role,
        fullName: r.full_name,
        note: r.note,
        invitedBy: r.invited_by,
        createdAt: r.created_at,
        lastSeenAt: r.last_seen_at,
        linked: r.user_id !== null,
      }
    : // A role the app does not understand is not a role it should honour. Someone adding a
      // value to the enum in SQL without shipping the code for it must not silently widen
      // access; this makes them ship the code.
      null;

const SELECT = "email, role, full_name, note, invited_by, created_at, last_seen_at, user_id";

/**
 * The signed-in caller's membership, or null.
 *
 * `getUser()` rather than `getSession()`: getSession trusts the cookie, getUser verifies it
 * with the auth server, and on a gate trusting the cookie is the whole vulnerability. The
 * row read is protected by RLS as well, so a tampered client cannot read anyone else's.
 *
 * Cached per request, so the layout, the page and any server action inside one render share
 * a single verification rather than each paying for their own round trip.
 */
export const getMember = cache(async (): Promise<Member | null> => {
  const supabase = await createClient();
  return memberFor(supabase);
});

/** The same read against a caller-supplied client, for the middleware's edge client. */
export async function memberFor(supabase: SupabaseClient): Promise<Member | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.trim().toLowerCase();
  if (!email) return null;

  const { data, error } = await supabase
    .from("members")
    .select(SELECT)
    .eq("email", email)
    .maybeSingle();

  // Fail closed. A database that is unreachable, misconfigured or mid-migration is a
  // database that cannot say anyone is allowed in, and the safe reading of "I do not know"
  // is "no". The alternative is an outage that opens the door.
  if (error || !data) return null;

  return toMember(data as Row);
}

/** Everyone on the list. Admin-only in practice: RLS returns just your own row otherwise. */
export async function listMembers(): Promise<Member[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select(SELECT)
    .order("role", { ascending: false })
    .order("email");
  if (error || !data) return [];
  return (data as Row[]).map(toMember).filter((m): m is Member => m !== null);
}
