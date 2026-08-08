"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { allowRequest } from "@/lib/rate-limit";
import { rsvpSchema } from "@/lib/schema";
import type { NewRsvp } from "@/lib/types";

export type SubmitResult =
  | { ok: true; passCode: string; familyName: string; attending: boolean }
  | { ok: false; error: string };

async function clientKey() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function submitRsvp(raw: unknown): Promise<SubmitResult> {
  const parsed = rsvpSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Some answers need another look. Please check the form." };
  }

  const data = parsed.data;

  // Honeypot tripped: a bot filled a field no guest can see. Look successful so
  // it doesn't learn anything, but store nothing.
  if (data.website.length > 0) {
    return { ok: true, passCode: "", familyName: data.familyName, attending: data.attending };
  }

  if (!allowRequest(await clientKey())) {
    return { ok: false, error: "That's a lot of RSVPs! Please wait a few minutes and try again." };
  }

  const clean: NewRsvp = {
    familyName: data.familyName.trim(),
    contact: data.contact.trim(),
    attending: data.attending,
    adultsCount: data.attending ? data.adultsCount : 0,
    staying: data.staying,
    emergencyPhone: data.emergencyPhone.trim(),
    team: data.team,
    wish: data.wish.trim(),
    photoConsent: data.photoConsent,
    notes: data.notes.trim(),
    children: data.attending
      ? data.children.map((c) => ({
          name: c.name.trim(),
          age: c.age,
          allergies: c.allergies.trim(),
          avatar: c.avatar,
        }))
      : [],
  };

  const rsvp = await db.createRsvp(clean);

  return {
    ok: true,
    passCode: rsvp.passCode,
    familyName: rsvp.familyName,
    attending: rsvp.attending,
  };
}
