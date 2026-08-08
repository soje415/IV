"use client";

import { m } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import type { RefObject } from "react";
import {
  CELEBRANTS,
  EVENT,
  eventDateLabel,
  eventTimeLabel,
} from "@/config/event";
import { headcountLabel, passUrl, type PassData } from "@/lib/pass";
import { useOrigin } from "@/lib/use-origin";

/**
 * The Golden Ticket: a boarding pass torn across a perforation.
 *
 * Stacked rather than side-by-side because a QR code and a legible family name
 * will not both fit across 360px. The card carries every detail a guest needs —
 * name, headcount, date, venue, code — so the downloaded PNG works with no
 * signal at all.
 */

const STRIPES: Record<string, string> = {
  tabitha: "bg-gradient-to-r from-tab-pink via-tab-lilac to-tab-mint",
  abraham: "bg-gradient-to-r from-abe-blue via-abe-violet to-abe-lime",
  none: "bg-gradient-to-r from-gold-soft via-gold to-gold-deep",
};

export function GoldenTicket({
  pass,
  captureRef,
  still = false,
}: {
  pass: PassData;
  /** Attached to the card itself so the PNG contains nothing else. */
  captureRef?: RefObject<HTMLDivElement | null>;
  /** Freezes the shimmer so it can't be caught mid-sweep in an export. */
  still?: boolean;
}) {
  const origin = useOrigin();
  const { tabitha, abraham } = CELEBRANTS;
  const stripe = STRIPES[pass.team ?? "none"];

  return (
    <div
      ref={captureRef}
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border-2 border-gold/50 bg-[#1b1033]"
    >
      <div className={`h-2.5 w-full ${stripe}`} />

      {/* ── Main body ── */}
      <div className="px-6 pt-6 pb-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-display text-2xl font-bold text-gold-gradient">
            {tabitha.turning}
          </span>
          <span className="font-display text-sm text-gold/60">&amp;</span>
          <span className="font-display text-2xl font-bold text-gold-gradient">
            {abraham.turning}
          </span>
        </div>
        <p className="mt-1 font-body text-[10px] font-bold tracking-[0.3em] text-gold/80 uppercase">
          {tabitha.firstName} &amp; {abraham.firstName}
        </p>

        <p className="mt-5 font-display text-2xl leading-tight font-bold text-cream">
          {pass.familyName}
        </p>
        <p className="mt-1 font-body text-sm text-cream/70">
          {headcountLabel(pass)}
        </p>

        <dl className="mt-5 space-y-1.5 text-left">
          <Row label="When" value={eventDateLabel()} />
          <Row label="Time" value={eventTimeLabel()} />
          <Row label="Where" value={EVENT.venue.name} />
        </dl>
      </div>

      <Perforation />

      {/* ── Stub ── */}
      <div className="flex items-center gap-4 px-6 pt-5 pb-6">
        <div className="rounded-xl bg-white p-2">
          <QRCodeSVG
            value={passUrl(pass.passCode, origin)}
            size={84}
            level="M"
            bgColor="#ffffff"
            fgColor="#1b1033"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body text-[9px] tracking-[0.25em] text-cream/45 uppercase">
            Pass code
          </p>
          <p className="mt-0.5 font-display text-lg font-bold tracking-wider break-all text-gold-gradient">
            {pass.passCode}
          </p>
          <p className="mt-2 font-body text-xs leading-snug text-cream/55">
            Show this at the door and we&apos;ll tick you off the list.
          </p>
        </div>
      </div>

      {/* Slow gold sweep. Paused for exports so it can't be frozen mid-pass. */}
      {still ? null : (
        <m.div
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/12 to-transparent"
          aria-hidden="true"
          animate={{ x: ["0%", "500%"] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            repeatDelay: 4.5,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-12 shrink-0 font-body text-[9px] tracking-[0.2em] text-cream/40 uppercase">
        {label}
      </dt>
      <dd className="flex-1 font-body text-sm text-cream/85">{value}</dd>
    </div>
  );
}

/** The tear line: two notches bitten out of the sides, dashes between. */
function Perforation() {
  return (
    <div className="relative h-6">
      <div className="absolute top-1/2 left-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
      <div className="absolute top-1/2 right-0 h-6 w-6 translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
      <div className="absolute inset-x-7 top-1/2 border-t-2 border-dashed border-white/20" />
    </div>
  );
}
