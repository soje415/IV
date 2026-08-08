import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * PIN gates for the two staff views.
 *
 * Not an account system — this guards one family's party for one day. What it
 * does guarantee: the cookie is signed, so it cannot be forged by editing
 * devtools, and changing a PIN invalidates every session using it.
 *
 * Two roles, because the people holding them are different. The host sees
 * contact details, allergies and wishes on /admin. A bouncer at the door is
 * often a cousin or a hired hand, gets the link on WhatsApp that morning, and
 * only needs /door. One PIN for both would mean handing the full guest list to
 * whoever is on the gate.
 */

export type Role = "host" | "door";

const ROLES = {
  host: { cookie: "host_session", env: "ADMIN_PIN", devPin: "0000" },
  door: { cookie: "door_session", env: "DOOR_PIN", devPin: "1234" },
} as const satisfies Record<Role, { cookie: string; env: string; devPin: string }>;

const MAX_AGE = 60 * 60 * 12; // A long party day, then sign out.

/**
 * The configured PIN for a role, or null if there isn't one.
 *
 * A weak default in production would be worse than no dashboard at all, so
 * outside development an unset PIN locks that door completely.
 */
export function configuredPin(role: Role): string | null {
  const pin = process.env[ROLES[role].env]?.trim();
  if (pin) return pin;
  return process.env.NODE_ENV === "development" ? ROLES[role].devPin : null;
}

function secret() {
  return process.env.PASS_SECRET ?? "dev-only-pass-secret-change-in-production";
}

/** Binding role and PIN into the token means rotating either logs those sessions out. */
function tokenFor(role: Role, pin: string) {
  return createHmac("sha256", secret()).update(`${role}-session:${pin}`).digest("hex");
}

function equals(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Roles a given PIN opens.
 *
 * The host PIN also opens the door, so the host can work the gate for ten
 * minutes without carrying a second PIN. The door PIN never opens /admin.
 */
function rolesFor(role: Role): Role[] {
  return role === "door" ? ["door", "host"] : ["host"];
}

export function pinMatches(role: Role, candidate: string) {
  const trimmed = candidate.trim();
  return rolesFor(role).some((r) => {
    const pin = configuredPin(r);
    return pin !== null && equals(trimmed, pin);
  });
}

export async function startSession(role: Role, pin: string) {
  // Issue the cookie for whichever role's PIN was actually entered, so a host
  // signing in at the door gets a host cookie and keeps it on /admin too.
  const matched = rolesFor(role).find((r) => {
    const configured = configuredPin(r);
    return configured !== null && equals(pin.trim(), configured);
  });
  if (!matched) return;

  const store = await cookies();
  store.set(ROLES[matched].cookie, tokenFor(matched, configuredPin(matched)!), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession(role: Role) {
  const store = await cookies();
  // Signing out of the door should not silently leave a host cookie behind.
  for (const r of rolesFor(role)) store.delete(ROLES[r].cookie);
}

export async function isSignedIn(role: Role) {
  const store = await cookies();
  return rolesFor(role).some((r) => {
    const pin = configuredPin(r);
    if (!pin) return false;
    const value = store.get(ROLES[r].cookie)?.value;
    return value ? equals(value, tokenFor(r, pin)) : false;
  });
}
