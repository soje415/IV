"use server";

import { revalidatePath } from "next/cache";
import { endSession, pinMatches, startSession } from "@/lib/admin-auth";
import { allowRequest } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function signIn(pin: string): Promise<{ ok: boolean; error?: string }> {
  const key = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "admin";
  if (!allowRequest(`admin:${key}`)) {
    return { ok: false, error: "Too many attempts. Wait a few minutes." };
  }

  if (!pinMatches(pin)) {
    return { ok: false, error: "That PIN doesn't match." };
  }

  await startSession();
  revalidatePath("/admin");
  return { ok: true };
}

export async function signOut() {
  await endSession();
  revalidatePath("/admin");
}
