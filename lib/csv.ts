import type { Rsvp } from "@/lib/types";

/** Quote anything containing a comma, quote or newline; double inner quotes. */
function cell(value: string | number | boolean | null) {
  const text =
    value === null ? "" : typeof value === "boolean" ? (value ? "yes" : "no") : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const FAMILY_HEADERS = [
  "Family",
  "Contact",
  "Attending",
  "Adults",
  "Children",
  "Child details",
  "Allergies",
  "Team",
  "Photo consent",
  "Notes",
  "Pass code",
  "Arrived at",
  "Wish",
];

const childSummary = (rsvp: Rsvp) =>
  rsvp.children
    .map((c) => `${c.name} (${c.age ?? "?"})${c.allergies.trim() ? ` — ${c.allergies.trim()}` : ""}`)
    .join("; ");

const allergySummary = (rsvp: Rsvp) =>
  rsvp.children
    .filter((c) => c.allergies.trim() !== "")
    .map((c) => `${c.name}: ${c.allergies}`)
    .join("; ");

export function rsvpsToCsv(rsvps: Rsvp[]) {
  const rows = rsvps.map((rsvp) =>
    [
      rsvp.familyName,
      rsvp.contact,
      rsvp.attending,
      rsvp.attending ? rsvp.adultsCount : 0,
      rsvp.attending ? rsvp.children.length : 0,
      childSummary(rsvp),
      allergySummary(rsvp),
      rsvp.team ?? "",
      rsvp.photoConsent,
      rsvp.notes,
      rsvp.passCode,
      rsvp.arrivedAt ?? "",
      rsvp.wish,
    ]
      .map(cell)
      .join(","),
  );

  // A BOM so Excel opens names with accents correctly rather than as mojibake.
  return `﻿${[FAMILY_HEADERS.join(","), ...rows].join("\r\n")}\r\n`;
}
