/**
 * The role ladder, and nothing else.
 *
 * Deliberately free of imports. lib/members.ts, which reads the database, is `server-only`,
 * and the navigation needs to know what a role can reach in order to decide what to render.
 * Without this split the header would either import a server-only module, or grow its own
 * second copy of the rules that would quietly drift from the gate's.
 */

export const ROLES = ["viewer", "user", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** Weakest first, matching the Postgres enum, so a comparison is the role ladder. */
const RANK: Record<Role, number> = { viewer: 0, user: 1, admin: 2 };

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/**
 * Does `role` meet `required`?
 *
 * Takes `Role | null` rather than `Role` on purpose: "not a member" is the common case at
 * every call site, and forcing each one to unwrap it invites somebody to unwrap it wrongly.
 */
export function meets(role: Role | null | undefined, required: Role): boolean {
  return role != null && RANK[role] >= RANK[required];
}

export const ROLE_LABEL: Record<Role, string> = {
  viewer: "Viewer",
  user: "User",
  admin: "Admin",
};

export const ROLE_BLURB: Record<Role, string> = {
  viewer: "Reads the map, the skills, the changelog and the systems. No Flightdeck.",
  user: "Everything a viewer can, plus their own Flightdeck and their own integrations.",
  admin: "Everything a user can, plus managing who is on this list.",
};
