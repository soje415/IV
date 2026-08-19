"use client";

import { m } from "motion/react";
import { EVENT } from "@/config/event";
import type { DoorFamily } from "@/lib/door";

/**
 * The four things the door needs to know about a family, and the one button
 * that acts on them. Shared by the list sheet and the scanned pass page so a
 * bouncer sees exactly the same screen whichever way they got there.
 */

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: EVENT.timeZone,
});

export function FamilyDetails({ family }: { family: DoorFamily }) {
  return (
    <>
      <p className="mt-1 font-body text-lg text-cream/80">
        {family.adults} {family.adults === 1 ? "adult" : "adults"}
        {family.children > 0
          ? ` · ${family.children} ${family.children === 1 ? "child" : "children"}`
          : ""}
      </p>

      {family.children > 0 ? (
        <p className="mt-4 flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 font-display text-xl font-bold text-cream">
          <span aria-hidden="true">🎁</span>
          {family.goodieBags} goodie {family.goodieBags === 1 ? "bag" : "bags"}
        </p>
      ) : null}

      {family.allergies.length > 0 ? (
        <div className="mt-3 rounded-2xl border-2 border-tab-pink/60 bg-tab-pink/15 px-4 py-3">
          <p className="font-body text-xs font-bold tracking-[0.15em] text-tab-pink uppercase">
            ⚠ Allergies
          </p>
          <ul className="mt-1.5 space-y-1">
            {family.allergies.map((entry) => (
              <li
                key={entry.name}
                className="font-display text-base font-semibold text-cream"
              >
                {entry.name} —{" "}
                <span className="font-body font-normal text-tab-pink">
                  {entry.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export function CheckInButton({
  arrivedAt,
  unsynced,
  onMark,
}: {
  arrivedAt: string | null;
  unsynced: boolean;
  onMark: () => void;
}) {
  if (arrivedAt !== null) {
    return (
      <div className="mt-5 flex min-h-16 items-center justify-center rounded-2xl border-2 border-tab-mint/50 bg-tab-mint/12 px-4 text-center font-display text-lg font-bold text-tab-mint">
        {unsynced
          ? "✓ ARRIVED · saving…"
          : `✓ ALREADY ARRIVED · ${timeFmt.format(new Date(arrivedAt))}`}
      </div>
    );
  }

  return (
    <m.button
      type="button"
      onClick={onMark}
      whileTap={{ scale: 0.97 }}
      className="mt-5 flex min-h-16 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-gold-soft via-gold to-gold-deep font-display text-xl font-bold tracking-wide text-ink"
    >
      MARK ARRIVED
    </m.button>
  );
}
