import type { CelebrantId } from "@/config/event";

export interface Child {
  id: string;
  name: string;
  age: number | null;
  allergies: string;
  /** Sticker the child picked — see AVATARS. */
  avatar: string;
}

export interface Rsvp {
  id: string;
  familyName: string;
  /** Email or phone / WhatsApp number. */
  contact: string;
  attending: boolean;
  adultsCount: number;
  team: CelebrantId | null;
  wish: string;
  photoConsent: boolean;
  notes: string;
  passCode: string;
  arrivedAt: string | null;
  createdAt: string;
  children: Child[];
}

export type NewRsvp = Omit<
  Rsvp,
  "id" | "passCode" | "arrivedAt" | "createdAt" | "children"
> & {
  children: Omit<Child, "id">[];
};

/** Everything the host actually calls the caterer with. */
export interface Totals {
  families: number;
  attendingFamilies: number;
  declined: number;
  adults: number;
  children: number;
  /** Adults + children. */
  cakeSlices: number;
  /** One per child. */
  goodieBags: number;
  arrived: number;
  withAllergies: number;
}

export type ArrivalResult =
  | { status: "marked"; rsvp: Rsvp }
  | { status: "already"; rsvp: Rsvp; arrivedAt: string }
  | { status: "not-found" };

export const AVATARS = [
  { id: "unicorn", label: "Unicorn", emoji: "🦄" },
  { id: "butterfly", label: "Butterfly", emoji: "🦋" },
  { id: "rainbow", label: "Rainbow", emoji: "🌈" },
  { id: "rocket", label: "Rocket", emoji: "🚀" },
  { id: "dinosaur", label: "Dinosaur", emoji: "🦕" },
  { id: "lion", label: "Lion", emoji: "🦁" },
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "star", label: "Star", emoji: "⭐" },
  { id: "robot", label: "Robot", emoji: "🤖" },
  { id: "cupcake", label: "Cupcake", emoji: "🧁" },
  { id: "dolphin", label: "Dolphin", emoji: "🐬" },
  { id: "dragon", label: "Dragon", emoji: "🐲" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export const avatarById = (id: string) =>
  AVATARS.find((a) => a.id === id) ?? AVATARS[AVATARS.length - 1];
