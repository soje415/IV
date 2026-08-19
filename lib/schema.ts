import { z } from "zod";
import { CHILD_AGE } from "@/config/event";

/**
 * One schema, used by the form in the browser and again by the server action.
 *
 * Deliberately free of `.trim()` and other transforms: keeping input and output
 * types identical avoids a lot of generic friction with react-hook-form. The
 * server action trims before storing.
 */

/** An email address, or a phone number long enough to be real. */
const CONTACT_RE = /^(?:[^\s@]+@[^\s@]+\.[^\s@]{2,}|\+?[\d\s()\-]{7,20})$/;

export const childSchema = z.object({
  name: z.string().min(1, "Please add their name").max(60, "That's a long name!"),
  age: z
    .number()
    .int()
    .min(CHILD_AGE.min, `This party is for ages ${CHILD_AGE.min}–${CHILD_AGE.max}`)
    .max(CHILD_AGE.max, `This party is for ages ${CHILD_AGE.min}–${CHILD_AGE.max}`),
  allergies: z.string().max(200, "Please keep this shorter"),
  avatar: z.string().min(1),
});

export const rsvpSchema = z
  .object({
    attending: z.boolean(),
    familyName: z
      .string()
      .min(2, "Please tell us your name")
      .max(80, "Please keep this shorter"),
    contact: z
      .string()
      .min(5, "We need a way to reach you")
      .max(120)
      .regex(CONTACT_RE, "Enter an email or a phone number"),
    adultsCount: z.number().int().min(1).max(2, "No more than 2 grown-ups, please"),
    children: z.array(childSchema).max(10, "That's a lot of children!"),
    team: z.enum(["tabitha", "abraham"]).nullable(),
    wish: z.string().max(300, "Please keep your message shorter"),
    photoConsent: z.boolean(),
    notes: z.string().max(300),
    /** Honeypot. Real guests never see it, so it must stay empty. */
    website: z.string().max(0),
  })
  .refine((v) => !v.attending || v.adultsCount + v.children.length > 0, {
    message: "Add at least one person",
    path: ["adultsCount"],
  });

export type RsvpFormValues = z.infer<typeof rsvpSchema>;

export const emptyRsvp: RsvpFormValues = {
  attending: true,
  familyName: "",
  contact: "",
  adultsCount: 1,
  children: [],
  team: null,
  wish: "",
  photoConsent: false,
  notes: "",
  website: "",
};

export const emptyChild = {
  name: "",
  age: 6,
  allergies: "",
  avatar: "star",
};
