"use client";

import { m } from "motion/react";
import { useEffect } from "react";
import type { SubmitResult } from "@/app/actions";
import { PassCard } from "@/components/pass/pass-card";
import { Farewell } from "@/components/rsvp/farewell";

/** Gold, pink and blue — one burst from each bottom corner, then the middle. */
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
  // Declines no longer reach the server — the flow ends at the blessing without
  // submitting. This branch stays because the result type still allows it, and
  // showing the same farewell is the right answer if one ever arrives.
  if (!result.attending) return <Farewell />;
  return <PassReveal result={result} />;
}

function PassReveal({
  result,
}: {
  result: Extract<SubmitResult, { ok: true; attending: true }>;
}) {
  useEffect(() => {
    void fireConfetti();
  }, []);

  return (
    <div className="text-center">
      <m.p
        className="font-body text-xs tracking-[0.3em] text-gold uppercase"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        You&apos;re on the list
      </m.p>
      <m.h3
        className="mt-2 font-display text-2xl font-bold text-cream sm:text-3xl"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        Here&apos;s your Golden Ticket
      </m.h3>

      <div className="mt-7">
        <PassCard pass={result.pass} reveal />
      </div>
    </div>
  );
}
