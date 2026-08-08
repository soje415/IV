import { CELEBRANTS, EVENT } from "@/config/event";
import type { PassData } from "@/lib/pass";
import { headcountLabel, passUrl } from "@/lib/pass";

/**
 * A calendar file the guest can open on any phone.
 *
 * Built by hand rather than pulled from a library: the format is small, and a
 * dependency here would ship more bytes than the whole feature.
 */

const stamp = (date: Date) =>
  date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Commas, semicolons and newlines are structural in iCalendar. */
const escape = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

/** RFC 5545 caps lines at 75 octets; continuations start with a space. */
function fold(line: string) {
  if (line.length <= 74) return line;
  const chunks = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length > 73) {
    chunks.push(` ${rest.slice(0, 73)}`);
    rest = rest.slice(73);
  }
  if (rest) chunks.push(` ${rest}`);
  return chunks.join("\r\n");
}

export function buildIcs(pass: PassData, origin?: string) {
  const { tabitha, abraham } = CELEBRANTS;
  const summary = `${tabitha.firstName} (${tabitha.turning}) & ${abraham.firstName} (${abraham.turning}) — Birthday Party`;
  const description = [
    `Your pass: ${pass.familyName} — ${headcountLabel(pass)}`,
    `Pass code: ${pass.passCode}`,
    `View your pass: ${passUrl(pass.passCode, origin)}`,
    EVENT.dressCode,
  ].join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ajayi Birthday Invite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${pass.passCode || "preview"}@ajayi-birthday`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(new Date(EVENT.startsAt))}`,
    `DTEND:${stamp(new Date(EVENT.endsAt))}`,
    `SUMMARY:${escape(summary)}`,
    `LOCATION:${escape(`${EVENT.venue.name}, ${EVENT.venue.address}`)}`,
    `DESCRIPTION:${escape(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape("The party is tomorrow!")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(fold).join("\r\n");
}

export function downloadIcs(pass: PassData, origin?: string) {
  const blob = new Blob([buildIcs(pass, origin)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tabitha-and-abraham-birthday.ics";
  link.click();
  URL.revokeObjectURL(url);
}
