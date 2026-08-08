"use client";

import { m } from "motion/react";
import { useEffect } from "react";
import type { SubmitResult } from "@/app/actions";

/** Gold, pink and blue — one burst from each bottom corner. */
async function fireConfetti() {
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#f5c542", "#ff8fc4", "#4d8bff", "#8feccf", "#fff9f0"];
  const shared = { particleCount: 60, spread: 70, colors, disableForReducedMotion: true };

  confetti({ ...shared, origin: { x: 0.1, y: 0.9 }, angle: 60 });
  confetti({ ...shared, origin: { x: 0.9, y: 0.9 }, angle: 120 });
  setTimeout(() => {
    confetti({ ...shared, particleCount: 90, origin: { x: 0.5, y: 0.75 }, angle: 90, spread: 100 });
  }, 220);
}

export function Success({ result }: { result: Extract<SubmitResult, { ok: true }> }) {
  useEffect(() => {
    if (result.attending) void fireConfetti();
  }, [result.attending]);

  if (!result.attending) {
    return (
      <m.div
        className="rounded-3xl border border-white/12 bg-white/5 p-8 text-center sm:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-5xl" aria-hidden="true">
          💛
        </span>
        <h3 className="mt-4 font-display text-2xl font-bold text-cream">
          Thank you for letting us know
        </h3>
        <p className="mt-3 font-body text-sm text-cream/70 sm:text-base">
          We&apos;ll miss you, {result.familyName}. Your message will be up on the
          screen at the party.
        </p>
      </m.div>
    );
  }

  return (
    <m.div
      className="rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-gold/12 to-transparent p-8 text-center sm:p-10"
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <m.span
        className="block text-5xl"
        aria-hidden="true"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.15 }}
      >
        🎟️
      </m.span>

      <h3 className="mt-4 font-display text-2xl font-bold text-cream sm:text-3xl">
        You&apos;re on the list!
      </h3>
      <p className="mt-2 font-body text-base text-cream/75">{result.familyName}</p>

      <div className="mt-6 inline-flex flex-col items-center rounded-2xl border border-gold/40 bg-ink/60 px-6 py-4">
        <span className="font-body text-[10px] tracking-[0.25em] text-cream/50 uppercase">
          Your pass code
        </span>
        <span className="mt-1 font-display text-2xl font-bold tracking-wider text-gold-gradient">
          {result.passCode}
        </span>
      </div>

      <p className="mt-6 font-body text-sm text-cream/60">
        Show this at the door and we&apos;ll tick you off the list. Your full
        Golden Ticket pass — with the QR code and a downloadable image — lands
        here in the next build phase.
      </p>
    </m.div>
  );
}
