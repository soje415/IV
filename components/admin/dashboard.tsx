import { signOut } from "@/app/admin/actions";
import { AgeHistogram, TeamSplit } from "@/components/admin/charts";
import { CELEBRANTS, EVENT } from "@/config/event";
import type { Rsvp, Totals } from "@/lib/types";
import { avatarById } from "@/lib/types";

/**
 * What the host actually needs on party week: numbers to give the caterer, a
 * list to give the kitchen, and enough detail to answer a parent's question.
 */

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: EVENT.timeZone,
});

export function Dashboard({ rsvps, totals }: { rsvps: Rsvp[]; totals: Totals }) {
  const attending = rsvps.filter((r) => r.attending);
  const declined = rsvps.filter((r) => !r.attending);
  const allergyRows = attending.flatMap((rsvp) =>
    rsvp.children
      .filter((child) => child.allergies.trim() !== "")
      .map((child) => ({ child, family: rsvp.familyName })),
  );
  const wishes = rsvps.filter((r) => r.wish.trim() !== "");

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Guest list
          </h1>
          <p className="mt-1 font-body text-sm text-cream/55">
            {CELEBRANTS.tabitha.firstName} &amp; {CELEBRANTS.abraham.firstName} ·{" "}
            {totals.families} {totals.families === 1 ? "reply" : "replies"} so far
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="min-h-11 rounded-full border border-white/15 px-4 font-body text-sm text-cream/70"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* ── The numbers you ring the caterer with ── */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Families" value={totals.attendingFamilies} tone="plain" />
        <Stat label="Adults" value={totals.adults} tone="plain" />
        <Stat label="Children" value={totals.children} tone="plain" />
        <Stat label="Cake slices" value={totals.cakeSlices} tone="gold" />
        <Stat label="Goodie bags" value={totals.goodieBags} tone="gold" />
        <Stat label="Arrived" value={`${totals.arrived}/${totals.attendingFamilies}`} tone="plain" />
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href="/admin/export"
          className="flex min-h-12 items-center rounded-2xl border border-white/15 bg-white/5 px-4 font-body text-sm font-bold text-cream"
        >
          ⬇︎ Export CSV
        </a>
        <a
          href="/admin/name-tags"
          className="flex min-h-12 items-center rounded-2xl border border-white/15 bg-white/5 px-4 font-body text-sm font-bold text-cream"
        >
          🏷️ Print name tags
        </a>
      </div>

      {/* ── The shape of the guest list, for planning ── */}
      <section className="mt-6 grid gap-3 md:grid-cols-2">
        <AgeHistogram rsvps={rsvps} />
        <TeamSplit rsvps={rsvps} />
      </section>

      {/* ── Allergies: the one thing that must not be missed ── */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-cream">
          Allergies &amp; food notes
        </h2>
        {allergyRows.length === 0 ? (
          <p className="mt-2 font-body text-sm text-cream/50">
            Nothing reported yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {allergyRows.map(({ child, family }) => (
              <li
                key={child.id}
                className="rounded-2xl border border-tab-pink/40 bg-tab-pink/10 px-4 py-3"
              >
                <p className="font-display text-base font-semibold text-cream">
                  {child.name}
                  {child.age !== null ? ` (${child.age})` : ""}{" "}
                  <span className="font-body text-xs font-normal text-cream/50">
                    · {family}
                  </span>
                </p>
                <p className="mt-0.5 font-body text-sm text-tab-pink">
                  {child.allergies}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Everyone coming ── */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-cream">
          Coming ({attending.length})
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {attending.map((rsvp) => (
            <FamilyCard key={rsvp.id} rsvp={rsvp} />
          ))}
        </div>
        {attending.length === 0 ? (
          <p className="mt-2 font-body text-sm text-cream/50">No replies yet.</p>
        ) : null}
      </section>

      {declined.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-cream">
            Can&apos;t make it ({declined.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {declined.map((rsvp) => (
              <li
                key={rsvp.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-body text-sm text-cream/70"
              >
                <span className="font-bold text-cream">{rsvp.familyName}</span> ·{" "}
                {rsvp.contact}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {wishes.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-cream">
            Birthday wishes ({wishes.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {wishes.map((rsvp) => (
              <li
                key={rsvp.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="font-body text-sm text-cream/80">
                  &ldquo;{rsvp.wish}&rdquo;
                </p>
                <p className="mt-1 font-body text-xs text-cream/45">
                  — {rsvp.familyName}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "plain" | "gold";
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        tone === "gold"
          ? "border-gold/40 bg-gold/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p
        className={`font-display text-3xl font-bold tabular-nums ${
          tone === "gold" ? "text-gold-gradient" : "text-cream"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 font-body text-[10px] tracking-[0.15em] text-cream/50 uppercase">
        {label}
      </p>
    </div>
  );
}

function FamilyCard({ rsvp }: { rsvp: Rsvp }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-cream">
            {rsvp.familyName}
          </h3>
          <p className="font-body text-sm text-cream/60">{rsvp.contact}</p>
        </div>
        {rsvp.arrivedAt ? (
          <span className="shrink-0 rounded-full bg-tab-mint/15 px-2.5 py-1 font-body text-[10px] font-bold text-tab-mint">
            ✓ {timeFmt.format(new Date(rsvp.arrivedAt))}
          </span>
        ) : null}
      </div>

      <p className="mt-3 font-body text-sm text-cream/80">
        {rsvp.adultsCount} {rsvp.adultsCount === 1 ? "adult" : "adults"}
        {rsvp.children.length > 0
          ? ` · ${rsvp.children.length} ${rsvp.children.length === 1 ? "child" : "children"}`
          : ""}
        {rsvp.staying ? " · staying" : " · dropping off"}
      </p>

      {rsvp.children.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {rsvp.children.map((child) => (
            <li key={child.id} className="font-body text-sm text-cream/70">
              <span aria-hidden="true">{avatarById(child.avatar).emoji}</span>{" "}
              {child.name}
              {child.age !== null ? `, ${child.age}` : ""}
              {child.allergies.trim() ? (
                <span className="text-tab-pink"> — {child.allergies.trim()}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="mt-3 space-y-0.5 font-body text-xs text-cream/45">
        {!rsvp.staying && rsvp.emergencyPhone ? (
          <div>Reach on: {rsvp.emergencyPhone}</div>
        ) : null}
        {rsvp.notes ? <div>Note: {rsvp.notes}</div> : null}
        {!rsvp.photoConsent ? (
          <div className="text-tab-pink">No photos of their children</div>
        ) : null}
        <div>{rsvp.passCode}</div>
      </dl>
    </article>
  );
}
