import { randomUUID } from "node:crypto";
import type { D1Like } from "@/lib/d1";
import type { InviteDb } from "@/lib/db-types";
import { createPassCode, normalisePassCode } from "@/lib/passcode";
import type { ArrivalResult, Child, NewRsvp, Rsvp, Totals } from "@/lib/types";

/** Cloudflare D1 (SQLite) behind the same interface as the local store. */

interface RsvpRow {
  id: string;
  family_name: string;
  contact: string;
  attending: number;
  adults_count: number;
  team: string | null;
  wish: string;
  photo_consent: number;
  notes: string;
  pass_code: string;
  arrived_at: string | null;
  created_at: string;
}

interface ChildRow {
  id: string;
  rsvp_id: string;
  name: string;
  age: number | null;
  allergies: string;
  avatar: string;
}

const toChild = (row: ChildRow): Child => ({
  id: row.id,
  name: row.name,
  age: row.age,
  allergies: row.allergies,
  avatar: row.avatar,
});

const toRsvp = (row: RsvpRow, children: Child[]): Rsvp => ({
  id: row.id,
  familyName: row.family_name,
  contact: row.contact,
  attending: row.attending === 1,
  adultsCount: row.adults_count,
  team: row.team === "tabitha" || row.team === "abraham" ? row.team : null,
  wish: row.wish,
  photoConsent: row.photo_consent === 1,
  notes: row.notes,
  passCode: row.pass_code,
  arrivedAt: row.arrived_at,
  createdAt: row.created_at,
  children,
});

const RSVP_COLUMNS =
  "id, family_name, contact, attending, adults_count, team, wish, photo_consent, notes, pass_code, arrived_at, created_at";

export function d1Db(database: D1Like): InviteDb {
  const childrenOf = async (rsvpId: string) => {
    const { results } = await database
      .prepare("SELECT * FROM children WHERE rsvp_id = ?1 ORDER BY rowid")
      .bind(rsvpId)
      .all<ChildRow>();
    return results.map(toChild);
  };

  const byId = async (id: string) => {
    const row = await database
      .prepare(`SELECT ${RSVP_COLUMNS} FROM rsvps WHERE id = ?1`)
      .bind(id)
      .first<RsvpRow>();
    return row ? toRsvp(row, await childrenOf(row.id)) : null;
  };

  return {
    async createRsvp(input: NewRsvp) {
      const id = randomUUID();
      const passCode = await createPassCode();
      const createdAt = new Date().toISOString();

      const children: Child[] = input.children.map((child) => ({
        ...child,
        id: randomUUID(),
      }));

      // One batch so a family and their children never land half-written.
      await database.batch([
        database
          .prepare(
            `INSERT INTO rsvps (${RSVP_COLUMNS})
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, NULL, ?11)`,
          )
          .bind(
            id,
            input.familyName,
            input.contact,
            input.attending ? 1 : 0,
            input.adultsCount,
            input.team,
            input.wish,
            input.photoConsent ? 1 : 0,
            input.notes,
            passCode,
            createdAt,
          ),
        ...children.map((child) =>
          database
            .prepare(
              "INSERT INTO children (id, rsvp_id, name, age, allergies, avatar) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            )
            .bind(child.id, id, child.name, child.age, child.allergies, child.avatar),
        ),
      ]);

      return {
        id,
        ...input,
        passCode,
        arrivedAt: null,
        createdAt,
        children,
      };
    },

    async listRsvps() {
      // Two queries rather than a join with N duplicated parent rows.
      const [rsvps, children] = await Promise.all([
        database
          .prepare(`SELECT ${RSVP_COLUMNS} FROM rsvps ORDER BY family_name COLLATE NOCASE`)
          .all<RsvpRow>(),
        database.prepare("SELECT * FROM children ORDER BY rowid").all<ChildRow>(),
      ]);

      const grouped = new Map<string, Child[]>();
      for (const row of children.results) {
        const list = grouped.get(row.rsvp_id) ?? [];
        list.push(toChild(row));
        grouped.set(row.rsvp_id, list);
      }

      return rsvps.results.map((row) => toRsvp(row, grouped.get(row.id) ?? []));
    },

    async getByPassCode(code: string) {
      const row = await database
        .prepare(`SELECT ${RSVP_COLUMNS} FROM rsvps WHERE pass_code = ?1`)
        .bind(normalisePassCode(code))
        .first<RsvpRow>();
      return row ? toRsvp(row, await childrenOf(row.id)) : null;
    },

    async markArrived(id: string): Promise<ArrivalResult> {
      const now = new Date().toISOString();

      // Conditional update: whoever gets there first sets the time, and a
      // second tap can't overwrite it.
      await database
        .prepare("UPDATE rsvps SET arrived_at = ?1 WHERE id = ?2 AND arrived_at IS NULL")
        .bind(now, id)
        .run();

      const rsvp = await byId(id);
      if (!rsvp) return { status: "not-found" };
      if (rsvp.arrivedAt === now) return { status: "marked", rsvp };
      return { status: "already", rsvp, arrivedAt: rsvp.arrivedAt! };
    },

    async totals(): Promise<Totals> {
      const [head, kids, allergies] = await Promise.all([
        database
          .prepare(
            `SELECT
               COUNT(*) AS families,
               COALESCE(SUM(attending), 0) AS attending_families,
               COALESCE(SUM(CASE WHEN attending = 1 THEN adults_count ELSE 0 END), 0) AS adults,
               COALESCE(SUM(CASE WHEN attending = 1 AND arrived_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS arrived
             FROM rsvps`,
          )
          .first<{
            families: number;
            attending_families: number;
            adults: number;
            arrived: number;
          }>(),
        database
          .prepare(
            `SELECT COUNT(*) AS n FROM children c
             JOIN rsvps r ON r.id = c.rsvp_id WHERE r.attending = 1`,
          )
          .first<{ n: number }>(),
        database
          .prepare(
            `SELECT COUNT(DISTINCT c.rsvp_id) AS n FROM children c
             JOIN rsvps r ON r.id = c.rsvp_id
             WHERE r.attending = 1 AND TRIM(c.allergies) <> ''`,
          )
          .first<{ n: number }>(),
      ]);

      const families = head?.families ?? 0;
      const attendingFamilies = head?.attending_families ?? 0;
      const adults = head?.adults ?? 0;
      const children = kids?.n ?? 0;

      return {
        families,
        attendingFamilies,
        declined: families - attendingFamilies,
        adults,
        children,
        cakeSlices: adults + children,
        goodieBags: children,
        arrived: head?.arrived ?? 0,
        withAllergies: allergies?.n ?? 0,
      };
    },
  };
}
