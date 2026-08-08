"use client";

import { m } from "motion/react";
import type { CelebrantId } from "@/config/event";

/**
 * A mascot walks the progress bar as the form is filled in.
 *
 * Starts as a balloon and becomes a unicorn or a rocket once the guest picks a
 * team, so the choice they just made follows them through the rest of the form.
 */
export function ProgressMascot({
  step,
  total,
  team,
}: {
  step: number;
  total: number;
  team: CelebrantId | null;
}) {
  const fraction = total <= 1 ? 1 : step / (total - 1);
  const mascot = team === "abraham" ? "🚀" : team === "tabitha" ? "🦄" : "🎈";

  return (
    <div className="mb-8">
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <m.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-tab-pink via-gold to-abe-blue"
          animate={{ width: `${Math.max(fraction, 0.02) * 100}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 26 }}
        />
        <m.div
          className="absolute top-1/2 -translate-y-1/2"
          animate={{ left: `${fraction * 100}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 26 }}
        >
          <m.span
            className="-ml-4 block text-2xl"
            aria-hidden="true"
            animate={{ y: [0, -5, 0], rotate: team === "abraham" ? [-8, 8, -8] : [0, 0, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            {mascot}
          </m.span>
        </m.div>
      </div>

      <p className="mt-4 text-center font-body text-xs tracking-[0.2em] text-cream/45 uppercase">
        Question {step + 1} of {total}
      </p>
    </div>
  );
}
