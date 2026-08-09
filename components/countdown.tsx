"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { START_DATE } from "@/config/event";

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function partsUntil(target: Date): Parts {
  const ms = Math.max(0, target.getTime() - Date.now());
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/**
 * Each digit rolls up like a scoreboard flap when it changes.
 *
 * The rolling copy is absolutely positioned, so it contributes no width. The
 * wrapper therefore carries its own em-based box — without it the unit collapses
 * and the countdown reads as missing on a narrow screen.
 */
function Roll({ value }: { value: string }) {
  return (
    <span className="relative block h-[1.15em] w-[0.62em] overflow-hidden text-center">
      <AnimatePresence initial={false}>
        <m.span
          key={value}
          className="absolute inset-0 block"
          initial={{ y: "-110%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "110%", opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

function Unit({
  value,
  label,
  short,
}: {
  value: number;
  label: string;
  short: string;
}) {
  const text = String(value).padStart(2, "0");

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="flex w-full items-center justify-center rounded-2xl border border-gold/30 bg-white/5 px-1 py-2.5 backdrop-blur-sm sm:px-3 sm:py-4">
        {/* clamp ties the digits to the viewport, so four boxes always fit a
            360px screen instead of relying on a breakpoint guess. */}
        <span className="flex font-display text-[clamp(1.6rem,8.5vw,3rem)] leading-none font-bold text-gold-gradient tabular-nums">
          {text.split("").map((digit, i) => (
            <Roll key={i} value={digit} />
          ))}
        </span>
      </div>

      {/* "MINUTES" at wide tracking is what overflows first on a phone, so the
          narrow screen gets the abbreviation. */}
      <span className="mt-2 font-body text-[10px] tracking-[0.1em] text-cream/60 uppercase sm:text-xs sm:tracking-[0.2em]">
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
    </div>
  );
}

export function Countdown() {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(partsUntil(START_DATE));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Rendered only after mount: the server has no idea what time it is here.
  // The placeholder matches the real height so nothing jumps on hydration.
  if (!parts) {
    return <div className="h-[104px] sm:h-[132px]" aria-hidden="true" />;
  }

  const started = parts.days + parts.hours + parts.minutes + parts.seconds === 0;

  if (started) {
    return (
      <p className="font-display text-2xl font-bold text-gold sm:text-4xl">
        It&apos;s party time! 🎉
      </p>
    );
  }

  return (
    // A four-column grid rather than a flex row: equal tracks keep the boxes
    // the same width and the labels on one baseline, whatever the digits do.
    <div
      className="mx-auto grid w-full max-w-md grid-cols-4 gap-2 sm:gap-3"
      role="timer"
      aria-label={`${parts.days} days until the party`}
    >
      <Unit value={parts.days} label="Days" short="Days" />
      <Unit value={parts.hours} label="Hours" short="Hrs" />
      <Unit value={parts.minutes} label="Minutes" short="Min" />
      <Unit value={parts.seconds} label="Seconds" short="Sec" />
    </div>
  );
}
