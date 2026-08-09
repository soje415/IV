"use client";

import { m } from "motion/react";
import { CELEBRANTS } from "@/config/event";

/**
 * The end of the road for a guest who can't come.
 *
 * No name, no contact, no submission — tapping "Sorry, we can't" shows this and
 * the flow is over. It is a blessing, not a form, so there is nothing here to
 * dismiss or continue past.
 */
export function Farewell() {
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
        We&apos;ll miss you
      </h3>

      <p className="mt-5 font-body text-base text-gold italic sm:text-lg">
        May God keep you and your family, and give you joy until we meet again.
        Amen.
      </p>

      <p className="mt-5 font-display text-sm font-semibold text-cream/80">
        — {CELEBRANTS.tabitha.firstName} &amp; {CELEBRANTS.abraham.firstName}
      </p>
    </m.div>
  );
}
