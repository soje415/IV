"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { CELEBRANTS } from "@/config/event";
import { Monogram } from "@/components/monogram";
import { AbrahamParticles, TabithaParticles } from "@/components/particles";

/**
 * The hero: two worlds either side of a gold seam.
 *
 * A full diagonal from md up; on phones the seam tilts gently and the worlds
 * stack top and bottom — a diagonal across 360px leaves neither side legible
 * (PLAN.md §8). Clip paths live in globals.css.
 */

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function SplitHero() {
  const { tabitha, abraham } = CELEBRANTS;

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden">
      {/* ── Backgrounds. Particles are clipped to their own half. ── */}
      <div className="absolute inset-0">
        <div className="clip-panel-a absolute inset-0 bg-gradient-to-br from-tab-cream via-tab-pink/70 to-tab-lilac">
          <PhotoBackdrop photos={tabitha.photos} opacity={0.5} />
          <TabithaParticles />
        </div>
        <div className="clip-panel-b absolute inset-0 bg-gradient-to-br from-abe-navy via-abe-deep to-abe-violet/50">
          <PhotoBackdrop photos={abraham.photos} opacity={0.55} />
          <AbrahamParticles />
        </div>
        {/* Gold seam tracing the join */}
        <div className="clip-panel-b absolute inset-0 bg-gradient-to-br from-gold/60 via-transparent to-transparent mix-blend-overlay" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 grid min-h-[100dvh] grid-rows-2 md:grid-cols-2 md:grid-rows-1">
        {/* Tabitha */}
        <div className="safe-t flex flex-col items-center justify-start px-6 text-center text-tab-deep md:items-start md:justify-center md:pl-10 md:text-left lg:pl-20">
          {/*
            Clearance for the floating Admin/Door nav, which sits top-right and
            would otherwise land on Tabitha's name. Only needed on a phone: from
            md up this panel is vertically centred and the nav clears it anyway.
          */}
          <m.p
            className="mt-14 font-body text-sm font-bold tracking-[0.3em] uppercase text-tab-deep/70 sm:text-base md:mt-0"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1.3}
          >
            You&apos;re invited
          </m.p>
          <m.h1
            className="font-display text-5xl leading-[0.95] font-bold sm:text-6xl md:text-7xl lg:text-8xl"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1.4}
          >
            {tabitha.firstName}
          </m.h1>
          <m.p
            className="mt-2 max-w-[15ch] font-body text-sm text-tab-deep/80 sm:text-base md:mt-4 md:max-w-[22ch]"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1.5}
          >
            {tabitha.tagline}
          </m.p>
        </div>

        {/* Abraham */}
        <div className="flex flex-col items-center justify-end px-6 pb-24 text-center text-cream md:items-end md:justify-center md:pr-10 md:pb-0 lg:pr-20">
          <m.h1
            className="font-display text-5xl leading-[0.95] font-bold sm:text-6xl md:text-7xl lg:text-8xl"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1.55}
          >
            {abraham.firstName}
          </m.h1>
          <m.p
            className="mt-2 max-w-[15ch] font-body text-sm text-cream/75 sm:text-base md:mt-4 md:max-w-[22ch]"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1.65}
          >
            {abraham.tagline}
          </m.p>
          <m.p
            className="mt-1 font-body text-xs tracking-[0.3em] uppercase text-gold/80 sm:text-sm"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1.75}
          >
            One party · Two birthdays
          </m.p>
        </div>
      </div>

      {/* ── The seam monogram ── */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <Monogram />
      </div>

      <ScrollCue />
    </section>
  );
}

const SLIDESHOW_MS = 3000;

/** Faint photos cycling behind a name — one at a time, crossfading. */
function PhotoBackdrop({ photos, opacity = 0.25 }: { photos: string[]; opacity?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % photos.length),
      SLIDESHOW_MS,
    );
    return () => clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence initial={false}>
        <m.img
          key={index}
          src={photos[index]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      </AnimatePresence>
    </div>
  );
}

function ScrollCue() {
  return (
    <m.div
      className="absolute inset-x-0 bottom-5 z-20 flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.1, duration: 0.6 }}
    >
      <m.div
        className="flex flex-col items-center gap-1 text-cream/70"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="font-body text-[10px] tracking-[0.25em] uppercase">
          Scroll
        </span>
        <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
          <path
            d="M1 1l8 7 8-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </m.div>
    </m.div>
  );
}
