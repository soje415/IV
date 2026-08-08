import type { Rsvp } from "@/lib/types";

/**
 * What the door is allowed to see.
 *
 * The bouncer needs four things: is this family expected, how many goodie bags,
 * any allergies, and who to ring if a child was dropped off. Contacts, wishes,
 * notes and photo consent stay on /admin — the person on the gate got the link
 * on WhatsApp that morning and does not need the parents' phone book.
 */
export interface DoorFamily {
  id: string;
  familyName: string;
  adults: number;
  children: number;
  /** One per child. */
  goodieBags: number;
  /** Searchable, so "Ada's mum" finds the Okafors. */
  childNames: string[];
  allergies: { name: string; note: string }[];
  staying: boolean;
  /** Only meaningful for drop-offs, which is when the door needs it. */
  emergencyPhone: string;
  arrivedAt: string | null;
}

export function toDoorFamily(rsvp: Rsvp): DoorFamily {
  return {
    id: rsvp.id,
    familyName: rsvp.familyName,
    adults: rsvp.adultsCount,
    children: rsvp.children.length,
    goodieBags: rsvp.children.length,
    childNames: rsvp.children.map((child) => child.name),
    allergies: rsvp.children
      .filter((child) => child.allergies.trim() !== "")
      .map((child) => ({ name: child.name, note: child.allergies.trim() })),
    staying: rsvp.staying,
    emergencyPhone: rsvp.staying ? "" : rsvp.emergencyPhone,
    arrivedAt: rsvp.arrivedAt,
  };
}

/** Only families who said yes turn up at the door. */
export const doorList = (rsvps: Rsvp[]) =>
  rsvps.filter((rsvp) => rsvp.attending).map(toDoorFamily);

/** Fold accents and case so "Adéyemi" is found by typing "adeyemi". */
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function matchesQuery(family: DoorFamily, query: string) {
  const needle = fold(query.trim());
  if (needle === "") return true;
  return [family.familyName, ...family.childNames].some((name) =>
    fold(name).includes(needle),
  );
}
