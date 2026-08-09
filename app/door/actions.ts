"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { endSession, isSignedIn, pinMatches, startSession } from "@/lib/gate";
import { allowRequest } from "@/lib/rate-limit";

export async function signIn(pin: string): Promise<{ ok: boolean; error?: string }> {
  const key = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "door";
  if (!allowRequest(`door:${key}`)) {
    return { ok: false, error: "Too many attempts. Wait a few minutes." };
  }

  if (!(await pinMatches("door", pin))) {
    return { ok: false, error: "That PIN doesn't match." };
  }

  await startSession("door", pin);
  revalidatePath("/door");
  return { ok: true };
}

export async function signOut() {
  await endSession("door");
  revalidatePath("/door");
}

export type CheckInResult =
  | { status: "marked"; arrivedAt: string }
  | { status: "already"; arrivedAt: string }
  | { status: "not-found" }
  | { status: "denied" };

/**
 * Record an arrival.
 *
 * Idempotent by way of `markArrived` — marking a family who is already in
 * reports the original time rather than overwriting it. That is what makes it
 * safe for the client to retry a write that failed on patchy venue wifi, and
 * it is the same duplicate protection a scanner would have given.
 */
export async function checkIn(id: string): Promise<CheckInResult> {
  if (!(await isSignedIn("door"))) return { status: "denied" };

  const result = await db.markArrived(id);
  if (result.status === "not-found") return { status: "not-found" };

  const arrivedAt =
    result.status === "already" ? result.arrivedAt : result.rsvp.arrivedAt!;

  revalidatePath("/door");
  revalidatePath("/admin");
  return { status: result.status, arrivedAt };
}
