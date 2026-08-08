import { randomUUID } from "node:crypto";
import { createPassCode, normalisePassCode } from "@/lib/passcode";
import type { ArrivalResult, NewRsvp, Rsvp, Totals } from "@/lib/types";

/**
 * The one seam between the app and whatever database we settle on.
 *
 * Every screen talks to `db` and nothing else, so swapping the local store for
 * Supabase or Firebase later is a single new implementation of this interface —
 * no UI changes. See PLAN.md §9.
 */
export interface InviteDb {
  createRsvp(input: NewRsvp): Promise<Rsvp>;
  listRsvps(): Promise<Rsvp[]>;
  getByPassCode(code: string): Promise<Rsvp | null>;
  /** Idempotent: marking an arrived family again reports the original time. */
  markArrived(id: string): Promise<ArrivalResult>;
  totals(): Promise<Totals>;
}

/** Survives Next's dev hot reload, which re-evaluates modules. */
const store = (() => {
  const g = globalThis as typeof globalThis & { __inviteRsvps?: Rsvp[] };
  g.__inviteRsvps ??= seed();
  return g.__inviteRsvps;
})();

function withIds(input: NewRsvp): Rsvp {
  return {
    ...input,
    id: randomUUID(),
    passCode: createPassCode(),
    arrivedAt: null,
    createdAt: new Date().toISOString(),
    children: input.children.map((child) => ({ ...child, id: randomUUID() })),
  };
}

export const localDb: InviteDb = {
  async createRsvp(input) {
    const rsvp = withIds(input);
    store.push(rsvp);
    return rsvp;
  },

  async listRsvps() {
    return [...store].sort((a, b) =>
      a.familyName.localeCompare(b.familyName, "en"),
    );
  },

  async getByPassCode(code) {
    const wanted = normalisePassCode(code);
    return store.find((r) => r.passCode === wanted) ?? null;
  },

  async markArrived(id) {
    const rsvp = store.find((r) => r.id === id);
    if (!rsvp) return { status: "not-found" };
    if (rsvp.arrivedAt) {
      return { status: "already", rsvp, arrivedAt: rsvp.arrivedAt };
    }
    rsvp.arrivedAt = new Date().toISOString();
    return { status: "marked", rsvp };
  },

  async totals() {
    const attending = store.filter((r) => r.attending);
    const adults = attending.reduce((n, r) => n + r.adultsCount, 0);
    const children = attending.reduce((n, r) => n + r.children.length, 0);
    return {
      families: store.length,
      attendingFamilies: attending.length,
      declined: store.length - attending.length,
      adults,
      children,
      cakeSlices: adults + children,
      goodieBags: children,
      arrived: attending.filter((r) => r.arrivedAt).length,
      withAllergies: attending.filter((r) =>
        r.children.some((c) => c.allergies.trim() !== ""),
      ).length,
    };
  },
};

export const db: InviteDb = localDb;

/** Sample families so the dashboard and door list have something to show. */
function seed(): Rsvp[] {
  const base: NewRsvp[] = [
    {
      familyName: "The Okafor Family",
      contact: "+234 803 000 0001",
      attending: true,
      adultsCount: 2,
      staying: true,
      emergencyPhone: "+234 803 000 0001",
      team: "tabitha",
      wish: "Happy birthday Tabitha and Abraham! We cannot wait.",
      photoConsent: true,
      notes: "",
      children: [
        { name: "Ada", age: 4, allergies: "Peanuts", avatar: "unicorn" },
        { name: "Chidi", age: 9, allergies: "", avatar: "rocket" },
      ],
    },
    {
      familyName: "Mrs Bello",
      contact: "bello.family@example.com",
      attending: true,
      adultsCount: 1,
      staying: false,
      emergencyPhone: "+234 805 000 0002",
      team: "abraham",
      wish: "Double digits already! Enjoy your day Abraham.",
      photoConsent: false,
      notes: "Collecting at 6pm sharp",
      children: [{ name: "Tofunmi", age: 10, allergies: "", avatar: "football" }],
    },
    {
      familyName: "The Adeyemi Family",
      contact: "+234 807 000 0003",
      attending: true,
      adultsCount: 2,
      staying: true,
      emergencyPhone: "+234 807 000 0003",
      team: "tabitha",
      wish: "Sending lots of love to the birthday stars.",
      photoConsent: true,
      notes: "",
      children: [
        { name: "Simi", age: 3, allergies: "Dairy — lactose free please", avatar: "butterfly" },
        { name: "Dami", age: 6, allergies: "", avatar: "dinosaur" },
        { name: "Tolu", age: 11, allergies: "", avatar: "dragon" },
      ],
    },
    {
      familyName: "Uncle Femi",
      contact: "+234 809 000 0004",
      attending: false,
      adultsCount: 1,
      staying: false,
      emergencyPhone: "",
      team: null,
      wish: "So sorry to miss it — have a wonderful party!",
      photoConsent: false,
      notes: "Travelling that weekend",
      children: [],
    },
  ];

  return base.map(withIds);
}
