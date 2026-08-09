"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * The build credit, with contact details behind a tap.
 *
 * The details are not printed on the page: this invite goes out to parents over
 * WhatsApp, and a phone number sitting in the markup is a phone number that
 * gets scraped. Someone who wants to reach the developer taps once; everyone
 * else just sees a name.
 */

const DEVELOPER = {
  name: "Bond Sustainable Intergrated Limited",
  /** Displayed in the local form guests will recognise… */
  phone: "0703 864 2707",
  /** …but dialled in full international form, which works from anywhere. */
  phoneHref: "tel:+2347038642707",
  email: "bondsustainable@gmail.com",
};

export function DeveloperCredit() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on Escape, or on a tap anywhere outside the card.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative mt-5 inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="min-h-11 font-body text-[11px] font-bold tracking-[0.1em] text-gold/85 uppercase underline decoration-gold/30 underline-offset-4 transition-colors hover:text-gold"
      >
        {DEVELOPER.name}
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            role="dialog"
            aria-label={`Contact ${DEVELOPER.name}`}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            // Anchored above the button so it never opens off the bottom of the
            // page, and width-capped so it fits a 360px screen.
            className="absolute bottom-full left-1/2 z-40 mb-3 w-[min(19rem,calc(100vw-2.5rem))] -translate-x-1/2 rounded-2xl border border-gold/30 bg-ink/95 p-4 text-left shadow-xl shadow-black/40 backdrop-blur"
          >
            <p className="font-display text-sm font-bold text-cream">
              {DEVELOPER.name}
            </p>

            <div className="mt-3 space-y-1">
              <a
                href={DEVELOPER.phoneHref}
                className="flex min-h-11 items-center gap-2.5 font-body text-sm text-cream/85 hover:text-gold"
              >
                <span aria-hidden="true">📞</span>
                {DEVELOPER.phone}
              </a>
              <a
                href={`mailto:${DEVELOPER.email}`}
                className="flex min-h-11 items-center gap-2.5 font-body text-sm break-all text-cream/85 hover:text-gold"
              >
                <span aria-hidden="true">✉️</span>
                {DEVELOPER.email}
              </a>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-1 min-h-11 w-full font-body text-xs text-cream/45 hover:text-cream/70"
            >
              Close
            </button>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
