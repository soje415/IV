"use client";

import { m, useReducedMotion } from "motion/react";
import { useState } from "react";

/**
 * A gold curtain that parts on load to reveal the hero.
 *
 * Removes itself from the DOM once it has finished so it can never sit over the
 * page swallowing taps. Skipped entirely when the guest prefers reduced motion.
 */
export function Curtain() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);

  if (reduced || done) return null;

  const panel =
    "absolute inset-y-0 w-[51%] bg-gradient-to-b from-gold-soft via-gold to-gold-deep";
  const transition = {
    duration: 1.1,
    delay: 0.35,
    ease: [0.83, 0, 0.17, 1] as const,
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      <m.div
        className={`${panel} left-0`}
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={transition}
        onAnimationComplete={() => setDone(true)}
      />
      <m.div
        className={`${panel} right-0`}
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={transition}
      />
      <m.div
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/70"
        initial={{ opacity: 1, scaleY: 1 }}
        animate={{ opacity: 0, scaleY: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      />
    </div>
  );
}
