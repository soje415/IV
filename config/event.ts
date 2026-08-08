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

/** Flip to true once every TODO(host) below is filled in for real. */
export const DETAILS_CONFIRMED = false;

export const EVENT = {
  /** TODO(host): the real party date and time. West Africa Time (+01:00). */
  startsAt: "2026-09-19T15:00:00+01:00",
  endsAt: "2026-09-19T19:00:00+01:00",
  timeZone: "Africa/Lagos",

  venue: {
    /** TODO(host) */
    name: "Venue to be confirmed",
    address: "Address to be confirmed",
    mapUrl: "",
  },

  /** TODO(host) */
  dressCode: "Come dressed to play — bright colours welcome",
  /** TODO(host) */
  giftPolicy: "Your presence is the present. No gifts needed.",
  /** TODO(host): last day to RSVP. */
  rsvpDeadline: "2026-09-12T23:59:00+01:00",
  /** TODO(host): number guests can call with questions. */
  hostPhone: "",
  hostName: "The Ajayi family",

  /** Used to build QR and share links. TODO(host): real domain. */
  siteUrl: "https://ajayi-invite.vercel.app",
};

export const START_DATE = new Date(EVENT.startsAt);
export const END_DATE = new Date(EVENT.endsAt);
export const RSVP_DEADLINE = new Date(EVENT.rsvpDeadline);

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

export const rsvpDeadlineLabel = () =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: EVENT.timeZone,
  }).format(RSVP_DEADLINE);
