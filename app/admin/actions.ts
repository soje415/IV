"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { endSession, pinMatches, startSession } from "@/lib/gate";
import { allowRequest } from "@/lib/rate-limit";

export async function signIn(pin: string): Promise<{ ok: boolean; error?: string }> {
  const key = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "admin";
  if (!allowRequest(`admin:${key}`)) {
    return { ok: false, error: "Too many attempts. Wait a few minutes." };
  }

  if (!pinMatches("host", pin)) {
    return { ok: false, error: "That PIN doesn't match." };
  }

  await startSession("host", pin);
  revalidatePath("/admin");
  return { ok: true };
}

export async function signOut() {
  await endSession("host");
  revalidatePath("/admin");
}
