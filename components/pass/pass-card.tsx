"use client";

import { m } from "motion/react";
import { useRef, useState } from "react";
import { GoldenTicket } from "@/components/pass/golden-ticket";
import { PassActions } from "@/components/pass/pass-actions";
import type { PassData } from "@/lib/pass";

/**
 * The ticket plus its buttons, wired together.
 *
 * Owns the capture ref and the "freeze the shimmer" flag so both the RSVP
 * success screen and the /p/<code> page get identical behaviour from one place.
 */
export function PassCard({
  pass,
  reveal = false,
}: {
  pass: PassData;
  /** Flip the ticket in, as the payoff after an RSVP. */
  reveal?: boolean;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const ticket = (
    <GoldenTicket pass={pass} captureRef={captureRef} still={capturing} />
  );

  return (
    <div>
      {reveal ? (
        // The flip needs depth on the parent, not the card.
        <div style={{ perspective: 1400 }}>
          <m.div
            initial={{ rotateY: 105, opacity: 0, scale: 0.9 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.35 }}
          >
            {ticket}
          </m.div>
        </div>
      ) : (
        <m.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {ticket}
        </m.div>
      )}

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reveal ? 1.1 : 0.25, duration: 0.5 }}
      >
        <PassActions
          pass={pass}
          captureRef={captureRef}
          onCaptureStart={() => setCapturing(true)}
          onCaptureEnd={() => setCapturing(false)}
        />
      </m.div>
    </div>
  );
}
