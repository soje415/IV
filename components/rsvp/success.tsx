"use client";

import { m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SubmitResult } from "@/app/actions";
import { GoldenTicket } from "@/components/pass/golden-ticket";
import { PassActions } from "@/components/pass/pass-actions";

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
  if (!result.attending) return <Declined familyName={result.familyName} />;
  return <PassReveal result={result} />;
}

function Declined({ familyName }: { familyName: string }) {
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
        We&apos;ll miss you, {familyName}. Your message will be up on the screen
        at the party.
      </p>
    </m.div>
  );
}

function PassReveal({
  result,
}: {
  result: Extract<SubmitResult, { ok: true; attending: true }>;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

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

      {/* The flip needs depth on the parent, not the card. */}
      <div className="mt-7" style={{ perspective: 1400 }}>
        <m.div
          initial={{ rotateY: 105, opacity: 0, scale: 0.9 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.35 }}
        >
          <GoldenTicket pass={result.pass} captureRef={captureRef} still={capturing} />
        </m.div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <PassActions
          pass={result.pass}
          captureRef={captureRef}
          onCaptureStart={() => setCapturing(true)}
          onCaptureEnd={() => setCapturing(false)}
        />
      </m.div>
    </div>
  );
}
