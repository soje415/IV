import type { CelebrantId } from "@/config/event";
import { EVENT } from "@/config/event";
import type { Rsvp } from "@/lib/types";

/** Everything the Golden Ticket needs to render. */
export interface PassData {
  passCode: string;
  familyName: string;
  adults: number;
  children: number;
  team: CelebrantId | null;
}

export function passFromRsvp(rsvp: Rsvp): PassData {
  return {
    passCode: rsvp.passCode,
    familyName: rsvp.familyName,
    adults: rsvp.adultsCount,
    children: rsvp.children.length,
    team: rsvp.team,
  };
}

export const passPath = (passCode: string) => `/p/${passCode}`;

/**
 * The URL the QR code encodes — a read-only view of the pass, never a check-in
 * endpoint. See PLAN.md §3 for why that distinction matters.
 */
export const passUrl = (passCode: string, origin: string = EVENT.siteUrl) =>
  `${origin.replace(/\/$/, "")}${passPath(passCode)}`;

/** "2 adults · 3 children", with the plurals right. */
export function headcountLabel({ adults, children }: PassData) {
  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} adult${adults === 1 ? "" : "s"}`);
  if (children > 0) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  return parts.join(" · ") || "No one yet";
}

export function shareText(pass: PassData, origin?: string) {
  return `We're going to Tabitha & Abraham's birthday party! 🎉\n\nOur pass for ${pass.familyName} (${headcountLabel(pass)}):\n${passUrl(pass.passCode, origin)}`;
}

export function whatsappHref(pass: PassData, origin?: string) {
  return `https://wa.me/?text=${encodeURIComponent(shareText(pass, origin))}`;
}

/** Safe for a filename on any platform. */
export const passFileName = (pass: PassData) =>
  `${pass.familyName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "guest"}-birthday-pass.png`;
