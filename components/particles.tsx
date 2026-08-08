"use client";

import { m } from "motion/react";
import { useMemo } from "react";
import { scatter } from "@/lib/random";

/**
 * Decorative layers for each celebrant's half of the hero.
 *
 * Everything animates on transform and opacity only, so the compositor handles
 * it and mid-range phones stay smooth. Items past `MOBILE_COUNT` are hidden
 * below md, which keeps the particle load light on small screens without any
 * JavaScript measuring the viewport.
 */

const MOBILE_COUNT = 5;

const hideOnMobile = (i: number) => (i < MOBILE_COUNT ? "" : "hidden md:block");

function Butterfly({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 6c-1.6-3-5-4.4-7.4-2.6C2.3 5.1 3 9.4 6 11.4c1.7 1.1 4 1.6 6 1.6s4.3-.5 6-1.6c3-2 3.7-6.3 1.4-8C17 1.6 13.6 3 12 6Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M12 12c-1.4 0-3.4.4-4.7 1.4-2 1.5-2.2 4.6-.4 5.8 1.8 1.2 4-.2 5.1-2.4 1.1 2.2 3.3 3.6 5.1 2.4 1.8-1.2 1.6-4.3-.4-5.8C15.4 12.4 13.4 12 12 12Z"
        fill="currentColor"
        opacity="0.6"
      />
      <rect x="11.4" y="5" width="1.2" height="13" rx="0.6" fill="currentColor" />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 0c.6 6.3 5.1 10.8 12 12-6.9 1.2-11.4 5.7-12 12-.6-6.3-5.1-10.8-12-12C6.9 10.8 11.4 6.3 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Tabitha's half: drifting butterflies and twinkling sparkles. */
export function TabithaParticles() {
  const butterflies = useMemo(
    () =>
      scatter(4041, 7, (rand) => ({
        left: 6 + rand() * 84,
        top: 8 + rand() * 78,
        size: 20 + rand() * 22,
        drift: 18 + rand() * 34,
        rise: 20 + rand() * 40,
        duration: 9 + rand() * 7,
        delay: rand() * 6,
        tint: rand() > 0.5 ? "text-tab-pink" : "text-tab-lilac",
      })),
    [],
  );

  const sparkles = useMemo(
    () =>
      scatter(1907, 12, (rand) => ({
        left: rand() * 96,
        top: rand() * 92,
        size: 6 + rand() * 12,
        duration: 2.4 + rand() * 2.6,
        delay: rand() * 5,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {sparkles.map((s, i) => (
        <m.div
          key={`s${i}`}
          className={`absolute text-white ${hideOnMobile(i)}`}
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1, 0.4], rotate: [0, 90] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkle className="h-full w-full" />
        </m.div>
      ))}

      {butterflies.map((b, i) => (
        <m.div
          key={`b${i}`}
          className={`absolute ${b.tint} ${hideOnMobile(i)}`}
          style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.95, 0.95, 0],
            x: [0, b.drift, -b.drift * 0.6, 0],
            y: [0, -b.rise, -b.rise * 0.4, 0],
            rotate: [-8, 10, -6, -8],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Butterfly className="h-full w-full drop-shadow-sm" />
        </m.div>
      ))}
    </div>
  );
}

/** Abraham's half: a starfield with comets cutting across it. */
export function AbrahamParticles() {
  const stars = useMemo(
    () =>
      scatter(1010, 26, (rand) => ({
        left: rand() * 98,
        top: rand() * 96,
        size: 1.5 + rand() * 2.5,
        duration: 1.8 + rand() * 3,
        delay: rand() * 4,
      })),
    [],
  );

  const comets = useMemo(
    () =>
      scatter(777, 5, (rand) => ({
        top: rand() * 70,
        left: 20 + rand() * 70,
        length: 70 + rand() * 90,
        duration: 1.6 + rand() * 1.4,
        delay: 1 + rand() * 9,
        repeatDelay: 6 + rand() * 10,
        tint: rand() > 0.5 ? "from-abe-lime" : "from-abe-blue",
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <m.div
          key={`st${i}`}
          className={`absolute rounded-full bg-white ${i < 12 ? "" : "hidden md:block"}`}
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.15, 1, 0.15] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {comets.map((c, i) => (
        <m.div
          key={`c${i}`}
          className={`absolute h-[2px] origin-right rounded-full bg-gradient-to-l ${c.tint} to-transparent ${hideOnMobile(i)}`}
          style={{ left: `${c.left}%`, top: `${c.top}%`, width: c.length, rotate: 35 }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: [-40, -260], y: [-30, 190] }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            repeat: Infinity,
            repeatDelay: c.repeatDelay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

/** Balloons drifting up behind the page content below the hero. */
export function Balloons() {
  const balloons = useMemo(
    () =>
      scatter(2468, 8, (rand) => ({
        left: rand() * 94,
        size: 26 + rand() * 30,
        duration: 16 + rand() * 14,
        delay: rand() * 14,
        sway: 14 + rand() * 26,
        hue: [
          "text-tab-pink",
          "text-tab-lilac",
          "text-abe-blue",
          "text-gold",
          "text-tab-mint",
          "text-abe-violet",
        ][Math.floor(rand() * 6)],
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {balloons.map((b, i) => (
        <m.div
          key={i}
          className={`absolute bottom-0 ${b.hue} ${hideOnMobile(i)}`}
          style={{ left: `${b.left}%`, width: b.size }}
          initial={{ y: 80, opacity: 0 }}
          animate={{
            y: ["10%", "-120vh"],
            x: [0, b.sway, -b.sway, 0],
            opacity: [0, 0.5, 0.5, 0],
            rotate: [-6, 6, -6],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg viewBox="0 0 40 60" className="h-auto w-full">
            <ellipse cx="20" cy="22" rx="16" ry="20" fill="currentColor" />
            <path d="M20 42 l-4 5 h8 Z" fill="currentColor" />
            <path
              d="M20 47 q6 6 0 13"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
          </svg>
        </m.div>
      ))}
    </div>
  );
}
