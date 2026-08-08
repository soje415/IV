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

/** Each digit rolls up like a scoreboard flap when it changes. */
function Roll({ value, width }: { value: string; width: string }) {
  return (
    <span
      className={`relative inline-block overflow-hidden text-center align-top ${width}`}
      style={{ height: "1.1em" }}
    >
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

function Unit({ value, label, pad }: { value: number; label: string; pad: number }) {
  const text = String(value).padStart(pad, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center rounded-2xl border border-gold/30 bg-white/5 px-3 py-2.5 backdrop-blur-sm sm:px-5 sm:py-4">
        <span className="font-display text-3xl leading-none font-bold text-gold-gradient tabular-nums sm:text-5xl">
          {text.split("").map((digit, i) => (
            <Roll key={i} value={digit} width="w-[0.62em]" />
          ))}
        </span>
      </div>
      <span className="mt-2 font-body text-[10px] tracking-[0.2em] text-cream/60 uppercase sm:text-xs">
        {label}
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
  if (!parts) {
    return <div className="h-[92px] sm:h-[124px]" aria-hidden="true" />;
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
    <div
      className="flex items-start justify-center gap-2 sm:gap-4"
      role="timer"
      aria-label={`${parts.days} days until the party`}
    >
      <Unit value={parts.days} label="Days" pad={2} />
      <Unit value={parts.hours} label="Hours" pad={2} />
      <Unit value={parts.minutes} label="Minutes" pad={2} />
      <Unit value={parts.seconds} label="Seconds" pad={2} />
    </div>
  );
}
