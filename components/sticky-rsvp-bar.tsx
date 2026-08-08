"use client";

import { AnimatePresence, m, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

/**
 * Slides up once the guest has scrolled past the hero.
 *
 * Keeps the hero uncluttered while making sure the one action that matters is
 * always a thumb away on a phone.
 */
export function StickyRsvpBar() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const past = typeof window !== "undefined" ? window.innerHeight * 0.75 : 600;
    setVisible(y > past);
  });

  return (
    <AnimatePresence>
      {visible ? (
        <m.div
          className="safe-b fixed inset-x-0 bottom-0 z-40 px-4 pt-3"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/90 to-transparent" />
          <a
            href="#rsvp"
            className="relative mx-auto flex min-h-14 w-full max-w-md items-center justify-center rounded-full bg-gradient-to-r from-gold-soft via-gold to-gold-deep px-6 font-display text-base font-bold text-ink shadow-lg shadow-gold/20 active:scale-[0.98] sm:text-lg"
          >
            RSVP &amp; get your pass 🎟️
          </a>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
