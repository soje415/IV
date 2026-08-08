import type { ArrivalResult, NewRsvp, Rsvp, Totals } from "@/lib/types";

/**
 * The one seam between the app and whatever database is behind it.
 *
 * Every screen talks to `db` from lib/db.ts and nothing else, so a new backend
 * is one implementation of this interface — no UI changes. See PLAN.md §9.
 */
export interface InviteDb {
  createRsvp(input: NewRsvp): Promise<Rsvp>;
  listRsvps(): Promise<Rsvp[]>;
  getByPassCode(code: string): Promise<Rsvp | null>;
  /** Idempotent: marking an arrived family again reports the original time. */
  markArrived(id: string): Promise<ArrivalResult>;
  totals(): Promise<Totals>;
}
