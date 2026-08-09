/**
 * Every piece of event content lives here.
 *
 * Values marked TODO(host) are placeholders. While `DETAILS_CONFIRMED` is false
 * the site shows a preview ribbon, so a link shared early can never quietly
 * hand a guest the wrong date or venue.
 */

export type CelebrantId = "tabitha" | "abraham";

export interface Celebrant {
  id: CelebrantId;
  firstName: string;
  fullName: string;
  turning: number;
  /** Label for the party-games team a guest can join. */
  team: string;
  tagline: string;
}

export const CELEBRANTS: Record<CelebrantId, Celebrant> = {
  tabitha: {
    id: "tabitha",
    firstName: "Tabitha",
    fullName: "Tabitha Ajayi",
    turning: 4,
    team: "Team Tabitha",
    tagline: "Sparkles, butterflies and birthday cake",
  },
  abraham: {
    id: "abraham",
    firstName: "Abraham",
    fullName: "Abraham Ajayi",
    turning: 10,
    team: "Team Abraham",
    tagline: "Double digits. Let's go.",
  },
};

export const CELEBRANT_LIST: Celebrant[] = [
  CELEBRANTS.tabitha,
  CELEBRANTS.abraham,
];

/**
 * True once every detail below is real rather than a placeholder.
 *
 * The deadline and the host's phone number are intentionally absent, not
 * missing: the host is sharing this link personally and wants neither.
 */
export const DETAILS_CONFIRMED = true;

/**
 * The ages this party is planned for.
 *
 * One source of truth: it bounds the age picker in the RSVP form, the server's
 * validation, and the buckets on the dashboard histogram.
 */
export const CHILD_AGE = { min: 2, max: 13 } as const;

export const EVENT = {
  /** West Africa Time (+01:00). */
  startsAt: "2026-09-19T13:00:00+01:00",
  endsAt: "2026-09-19T18:00:00+01:00",
  timeZone: "Africa/Lagos",

  venue: {
    name: "Tropic Galleria",
    address: "Opposite Grand Square",
    mapUrl: "https://share.google/cAeyXBmXRp9jQCQFW",
    /** Google's embed URL for the same place — see components/map.tsx. */
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.105129877275!2d7.47618197501915!3d9.054174591008119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0b58a0032c29%3A0xf58f145d7f815d14!2sTropic%20Galleria!5e0!3m2!1sen!2sng!4v1786283719366!5m2!1sen!2sng",
  },

  dressCode: "Dress to play — there'll be children everywhere",
  giftPolicy: "Gifts are welcome, and so is just showing up.",
  /**
   * No deadline: the host is sending this link to people they know, and would
   * rather a late yes than a closed door.
   */
  rsvpDeadline: null,
  /**
   * Deliberately blank. The host shares this link personally, so guests already
   * have a way to reach them and their number does not belong on a public page.
   */
  hostPhone: "",
  hostName: "The Ajayi family",

  /**
   * Used to build QR and share links, so it must match where the site actually
   * lives — a pass issued against the wrong origin has a QR that goes nowhere.
   * The workers.dev subdomain still resolves, but passes must carry the domain
   * guests were given.
   */
  siteUrl: "https://invite.tabithaabraham.com",
};

export const START_DATE = new Date(EVENT.startsAt);
export const END_DATE = new Date(EVENT.endsAt);
export const RSVP_DEADLINE = EVENT.rsvpDeadline
  ? new Date(EVENT.rsvpDeadline)
  : null;

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: EVENT.timeZone,
});

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: EVENT.timeZone,
});

export const eventDateLabel = () => DATE_FMT.format(START_DATE);

export const eventTimeLabel = () =>
  `${TIME_FMT.format(START_DATE)} – ${TIME_FMT.format(END_DATE)}`;

/** Null when the host has chosen not to set a deadline. */
export const rsvpDeadlineLabel = () =>
  RSVP_DEADLINE === null
    ? null
    : new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: EVENT.timeZone,
      }).format(RSVP_DEADLINE);
