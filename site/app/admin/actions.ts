"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { isRole } from "@/lib/roles";

/**
 * Writes for the admin screen.
 *
 * Every action re-checks that the caller is an admin. That is not paperwork: a server action
 * is a public POST endpoint with a generated URL, reachable by anyone who has ever loaded a
 * page that referenced it, so the page-level check that hid the button is not a check on the
 * action. RLS on `members` refuses these writes for non-admins as well, which is the real
 * boundary; this layer exists to fail with a sentence rather than an empty result.
 */

type Result = { ok: true } | { ok: false; message: string };

async function requireAdmin() {
  const me = await getMember();
  if (!me || me.role !== "admin") return null;
  return me;
}

function cleanEmail(raw: FormDataEntryValue | null): string | null {
  const email = String(raw ?? "").trim().toLowerCase();
  // Matches the CHECK constraints on the table, so the failure is a sentence here rather
  // than a Postgres error surfaced from a round trip.
  if (!email || email.length > 320) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export async function addMember(formData: FormData): Promise<Result> {
  const me = await requireAdmin();
  if (!me) return { ok: false, message: "Only an admin can change the member list." };

  const email = cleanEmail(formData.get("email"));
  if (!email) return { ok: false, message: "That does not look like an email address." };

  const role = String(formData.get("role") ?? "viewer");
  if (!isRole(role)) return { ok: false, message: "Unknown role." };

  const fullName = String(formData.get("full_name") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .insert({ email, role, full_name: fullName, invited_by: me.email });

  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? `${email} is already on the list.` : error.message,
    };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function setRole(formData: FormData): Promise<Result> {
  const me = await requireAdmin();
  if (!me) return { ok: false, message: "Only an admin can change the member list." };

  const email = cleanEmail(formData.get("email"));
  const role = String(formData.get("role") ?? "");
  if (!email || !isRole(role)) return { ok: false, message: "Unknown member or role." };

  const supabase = await createClient();
  const { error } = await supabase.from("members").update({ role }).eq("email", email);

  // The database refuses to leave itself with no admin (a deferred constraint trigger), so
  // demoting the last one arrives here as an error rather than as a locked-out team.
  if (error) return { ok: false, message: friendly(error.message) };

  revalidatePath("/admin");
  return { ok: true };
}

export async function removeMember(formData: FormData): Promise<Result> {
  const me = await requireAdmin();
  if (!me) return { ok: false, message: "Only an admin can change the member list." };

  const email = cleanEmail(formData.get("email"));
  if (!email) return { ok: false, message: "Unknown member." };

  // Removing yourself is not forbidden by the database as long as another admin remains, but
  // it is almost never what was meant by a click on the row you happen to be sitting in.
  if (email === me.email) {
    return { ok: false, message: "You cannot remove yourself. Ask another admin." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("members").delete().eq("email", email);
  if (error) return { ok: false, message: friendly(error.message) };

  revalidatePath("/admin");
  return { ok: true };
}

function friendly(message: string): string {
  return message.includes("at least one admin must remain")
    ? "That would leave the site with no admin. Promote somebody else first."
    : message;
}
