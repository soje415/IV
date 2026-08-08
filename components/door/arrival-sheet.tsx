"use client";

import { m } from "motion/react";
import { useEffect } from "react";
import { CheckInButton, FamilyDetails } from "@/components/door/family-details";
import type { DoorFamily } from "@/lib/door";

/**
 * The sheet that slides up when a bouncer taps a family.
 *
 * It closes on its own a moment after a successful tap, so the queue keeps
 * moving without anyone hunting for a close button.
 */

const CLOSE_DELAY_MS = 1400;

export function ArrivalSheet({
  family,
  unsynced,
  onMark,
  onClose,
}: {
  family: DoorFamily;
  unsynced: boolean;
  onMark: () => void;
  onClose: () => void;
}) {
  const arrived = family.arrivedAt !== null;

  // Auto-close once they are in, so the queue keeps moving. `onClose` must be
  // stable in the parent or this timer would restart on every render.
  useEffect(() => {
    if (!arrived) return;
    const timer = window.setTimeout(onClose, CLOSE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [arrived, onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <m.button
        type="button"
        aria-label="Close"
        className="fixed inset-0 z-30 bg-ink/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <m.div
        role="dialog"
        aria-modal="true"
        aria-label={family.familyName}
        className="safe-b fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg rounded-t-3xl border-t border-white/15 bg-ink px-5 pt-3"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <span
          aria-hidden="true"
          className="mx-auto mb-4 block h-1.5 w-10 rounded-full bg-white/25"
        />

        <h2 className="font-display text-2xl font-bold text-cream">
          {family.familyName}
        </h2>

        <FamilyDetails family={family} />
        <CheckInButton
          arrivedAt={family.arrivedAt}
          unsynced={unsynced}
          onMark={onMark}
        />

        <button
          type="button"
          onClick={onClose}
          className="mt-2 mb-2 min-h-12 w-full font-body text-sm text-cream/50"
        >
          Close
        </button>
      </m.div>
    </>
  );
}
