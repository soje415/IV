import { randomUUID } from "node:crypto";
import { getD1 } from "@/lib/d1";
import { d1Db } from "@/lib/db-d1";
import type { InviteDb } from "@/lib/db-types";
import { createPassCode, normalisePassCode, seedPassCode } from "@/lib/passcode";
import type { NewRsvp, Rsvp } from "@/lib/types";

export type { InviteDb } from "@/lib/db-types";

/**
 * Survives Next's dev hot reload, which re-evaluates modules.
 *
 * The promise itself is cached, not the array: signing a pass code is async now,
 * so caching the array would let two concurrent first-calls each seed the store.
 */
function getStore(): Promise<Rsvp[]> {
  const g = globalThis as typeof globalThis & { __inviteRsvps?: Promise<Rsvp[]> };
  g.__inviteRsvps ??= seed();
  return g.__inviteRsvps;
}

async function withIds(input: NewRsvp, passCode?: string): Promise<Rsvp> {
  return {
    ...input,
    id: randomUUID(),
    passCode: passCode ?? (await createPassCode()),
    arrivedAt: null,
    createdAt: new Date().toISOString(),
    children: input.children.map((child) => ({ ...child, id: randomUUID() })),
  };
}

export const localDb: InviteDb = {
  async createRsvp(input) {
    const store = await getStore();
    const rsvp = await withIds(input);
    store.push(rsvp);
    return rsvp;
  },

  async listRsvps() {
    const store = await getStore();
    return [...store].sort((a, b) =>
      a.familyName.localeCompare(b.familyName, "en"),
    );
  },

  async getByPassCode(code) {
    const store = await getStore();
    const wanted = normalisePassCode(code);
    return store.find((r) => r.passCode === wanted) ?? null;
  },

  async markArrived(id) {
    const store = await getStore();
    const rsvp = store.find((r) => r.id === id);
    if (!rsvp) return { status: "not-found" };
    if (rsvp.arrivedAt) {
      return { status: "already", rsvp, arrivedAt: rsvp.arrivedAt };
    }
    rsvp.arrivedAt = new Date().toISOString();
    return { status: "marked", rsvp };
  },

  async totals() {
    const store = await getStore();
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

/**
 * Cloudflare D1 when the binding is there, the in-memory store otherwise.
 *
 * Resolved per call rather than at module load: on Workers the binding is only
 * reachable inside a request, and during `next dev` there is none at all.
 */
async function backend(): Promise<InviteDb> {
  const binding = await getD1();
  return binding ? d1Db(binding) : localDb;
}

/** True when RSVPs are going into memory and will not survive a restart. */
export async function isEphemeral(): Promise<boolean> {
  return (await getD1()) === null;
}

export const db: InviteDb = {
  createRsvp: async (input) => (await backend()).createRsvp(input),
  listRsvps: async () => (await backend()).listRsvps(),
  getByPassCode: async (code) => (await backend()).getByPassCode(code),
  markArrived: async (id) => (await backend()).markArrived(id),
  totals: async () => (await backend()).totals(),
};

/** Sample families so the dashboard and door list have something to show. */
async function seed(): Promise<Rsvp[]> {
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

  return Promise.all(
    base.map(async (rsvp) =>
      withIds(rsvp, await seedPassCode(rsvp.familyName)),
    ),
  );
}
