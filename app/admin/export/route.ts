import { rsvpsToCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { isSignedIn } from "@/lib/gate";

/**
 * The guest list as a spreadsheet.
 *
 * Behind the same PIN as the dashboard — this file has children's names,
 * allergies and parents' phone numbers in it.
 */
export async function GET() {
  if (!(await isSignedIn("host"))) {
    return new Response("Not signed in", { status: 401 });
  }

  const csv = rsvpsToCsv(await db.listRsvps());
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="guest-list-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
