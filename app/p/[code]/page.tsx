import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScanCheckIn } from "@/components/door/scan-check-in";
import { PassCard } from "@/components/pass/pass-card";
import { PreviewRibbon } from "@/components/preview-ribbon";
import {
  CELEBRANTS,
  EVENT,
  eventDateLabel,
  eventTimeLabel,
} from "@/config/event";
import { db } from "@/lib/db";
import { toDoorFamily } from "@/lib/door";
import { isSignedIn } from "@/lib/gate";
import { passFromRsvp } from "@/lib/pass";
import { isValidPassCode } from "@/lib/passcode";

/**
 * The pass view — what the QR code on a Golden Ticket opens.
 *
 * Read-only for guests, and that is the whole point: a guest scanning their own
 * code must not be able to check themselves in, and a forwarded screenshot must
 * not check in a stranger.
 *
 * The one exception is a request carrying a door session. For a bouncer this
 * page doubles as the check-in screen, so pointing the phone's camera at a
 * guest's QR is a faster route to the same MARK ARRIVED button as finding them
 * on /door. Authority comes from the PIN cookie, never from the code — so the
 * page a parent sees is unchanged. See PLAN.md §3.
 */

export const metadata: Metadata = {
  title: "Your pass",
  // Passes are personal. Keep them out of search results entirely.
  robots: { index: false, follow: false },
};

export default async function PassPage({ params }: PageProps<"/p/[code]">) {
  const { code } = await params;

  // Reject malformed codes before touching the store — a wrong HMAC suffix
  // means the code was guessed or mistyped, not issued.
  if (!isValidPassCode(code)) notFound();

  const rsvp = await db.getByPassCode(code);
  if (!rsvp) notFound();

  const atTheDoor = await isSignedIn("door");
  const { tabitha, abraham } = CELEBRANTS;

  return (
    <>
      <PreviewRibbon />
      <main className="mx-auto w-full max-w-md px-5 pt-10 pb-16">
        <Link
          href="/"
          className="mb-8 flex flex-col items-center gap-1 text-center"
        >
          <span className="font-display text-lg font-bold text-gold-gradient">
            {tabitha.firstName} &amp; {abraham.firstName}
          </span>
          <span className="font-body text-[10px] tracking-[0.25em] text-cream/45 uppercase">
            {tabitha.turning} &amp; {abraham.turning} · One party
          </span>
        </Link>

        {rsvp.attending ? (
          <>
            <PassCard pass={passFromRsvp(rsvp)} />
            {rsvp.arrivedAt && !atTheDoor ? (
              <ArrivedBadge at={rsvp.arrivedAt} />
            ) : null}
            {atTheDoor ? <ScanCheckIn family={toDoorFamily(rsvp)} /> : null}
          </>
        ) : (
          <CannotMakeIt familyName={rsvp.familyName} />
        )}

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-display text-base font-semibold text-gold">
            Party details
          </h2>
          <dl className="mt-3 space-y-2">
            <Row label="When" value={eventDateLabel()} />
            <Row label="Time" value={eventTimeLabel()} />
            <Row label="Where" value={EVENT.venue.name} />
            <Row label="Address" value={EVENT.venue.address} />
            <Row label="Wear" value={EVENT.dressCode} />
          </dl>
          {EVENT.venue.mapUrl ? (
            <a
              href={EVENT.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 font-body text-sm font-bold text-cream"
            >
              📍 Open in Maps
            </a>
          ) : null}
        </section>

        <p className="mt-8 text-center font-body text-xs text-cream/40">
          Keep this link — it&apos;s your pass. Save the image so you have it
          even without signal.
        </p>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 font-body text-[10px] tracking-[0.15em] text-cream/40 uppercase">
        {label}
      </dt>
      <dd className="flex-1 font-body text-sm text-cream/80">{value}</dd>
    </div>
  );
}

function ArrivedBadge({ at }: { at: string }) {
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: EVENT.timeZone,
  }).format(new Date(at));

  return (
    <p className="mt-5 rounded-2xl border border-tab-mint/40 bg-tab-mint/10 py-3 text-center font-body text-sm font-bold text-tab-mint">
      ✓ Checked in at {time}
    </p>
  );
}

function CannotMakeIt({ familyName }: { familyName: string }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/5 p-8 text-center">
      <span className="text-4xl" aria-hidden="true">
        💛
      </span>
      <h2 className="mt-4 font-display text-xl font-bold text-cream">
        We know you can&apos;t make it
      </h2>
      <p className="mt-2 font-body text-sm text-cream/70">
        {familyName} told us they&apos;ll be missing this one. If that&apos;s
        changed, send us a message — we&apos;d love to have you.
      </p>
    </div>
  );
}
