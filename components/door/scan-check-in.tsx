"use client";

import Link from "next/link";
import { CheckInButton, FamilyDetails } from "@/components/door/family-details";
import { useArrivals } from "@/components/door/use-arrivals";
import type { DoorFamily } from "@/lib/door";

/**
 * Check-in on a scanned pass.
 *
 * Only rendered when the request carries a door session, so a parent opening
 * their own pass — or a forwarded screenshot of one — still gets the read-only
 * view and cannot check anybody in.
 *
 * There is no scanner in this app. The bouncer points the phone's own camera at
 * the QR already printed on the pass, which opens this page. That keeps camera
 * permissions, dim-light focus and scan queues as the operating system's
 * problem rather than ours, and /door stays the fallback when a guest's phone
 * is flat.
 */
export function ScanCheckIn({ family }: { family: DoorFamily }) {
  const { arrivals, pending, expired, mark } = useArrivals();
  const arrivedAt = family.arrivedAt ?? arrivals[family.id] ?? null;

  return (
    <section className="mt-8 rounded-3xl border-2 border-gold/40 bg-gold/[0.07] p-5">
      <p className="font-body text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
        Door check-in
      </p>

      <h2 className="mt-2 font-display text-2xl font-bold text-cream">
        {family.familyName}
      </h2>

      <FamilyDetails family={family} />

      {expired ? (
        <p
          className="mt-4 rounded-xl bg-tab-pink/15 px-3 py-2 font-body text-sm text-tab-pink"
          role="alert"
        >
          Your door session expired.{" "}
          <Link href="/door" className="font-bold underline underline-offset-4">
            Enter the PIN again
          </Link>
          .
        </p>
      ) : (
        <CheckInButton
          arrivedAt={arrivedAt}
          unsynced={pending.includes(family.id)}
          onMark={() => mark(family.id)}
        />
      )}

      <Link
        href="/door"
        className="mt-2 flex min-h-12 items-center justify-center font-body text-sm text-cream/50"
      >
        ← Full door list
      </Link>
    </section>
  );
}
