import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * A PIN gate for the host dashboard.
 *
 * Not an account system — this guards one person's view of one party for one
 * day. What it does guarantee: the cookie is signed, so it cannot be forged by
 * editing devtools, and changing the PIN invalidates every existing session.
 */

const COOKIE = "host_session";
const MAX_AGE = 60 * 60 * 12; // A long party day, then sign out.

/**
 * The configured PIN, or null if there isn't one.
 *
 * A weak default in production would be worse than no dashboard at all, so
 * outside development an unset ADMIN_PIN locks the door completely.
 */
export function configuredPin(): string | null {
  const pin = process.env.ADMIN_PIN?.trim();
  if (pin) return pin;
  return process.env.NODE_ENV === "development" ? "0000" : null;
}

function secret() {
  return process.env.PASS_SECRET ?? "dev-only-pass-secret-change-in-production";
}

/** Binding the PIN into the token means rotating it logs everyone out. */
function tokenFor(pin: string) {
  return createHmac("sha256", secret()).update(`admin-session:${pin}`).digest("hex");
}

function equals(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function pinMatches(candidate: string) {
  const pin = configuredPin();
  if (!pin) return false;
  return equals(candidate.trim(), pin);
}

export async function startSession() {
  const pin = configuredPin();
  if (!pin) return;
  const store = await cookies();
  store.set(COOKIE, tokenFor(pin), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isSignedIn() {
  const pin = configuredPin();
  if (!pin) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  return value ? equals(value, tokenFor(pin)) : false;
}
