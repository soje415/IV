"use client";

import { m } from "motion/react";
import { CELEBRANTS } from "@/config/event";

/**
 * The gold "4 & 10" that sits on the seam between the two worlds — the thing
 * that makes one shared party out of two very different birthdays.
 */
export function Monogram() {
  return (
    <m.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0, rotate: -25, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 12, delay: 1.15 }}
    >
      {/* Slow gold halo behind the numerals */}
      <m.div
        className="absolute h-32 w-32 rounded-full bg-gold/25 blur-2xl sm:h-44 sm:w-44"
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <m.div
        className="relative flex items-center gap-2 rounded-full border-2 border-gold/70 bg-ink/80 px-5 py-2.5 backdrop-blur-md sm:gap-3 sm:px-8 sm:py-4"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="font-display text-4xl font-bold text-gold-gradient sm:text-6xl">
          {CELEBRANTS.tabitha.turning}
        </span>
        <span className="font-display text-xl text-gold/70 sm:text-3xl">&amp;</span>
        <span className="font-display text-4xl font-bold text-gold-gradient sm:text-6xl">
          {CELEBRANTS.abraham.turning}
        </span>
      </m.div>
    </m.div>
  );
}
