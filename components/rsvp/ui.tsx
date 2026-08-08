"use client";

import { AnimatePresence, m } from "motion/react";
import type { ReactNode } from "react";
import { AVATARS } from "@/lib/types";

/**
 * Form furniture for the RSVP flow.
 *
 * Everything here is sized for a thumb: controls are at least 56px tall and
 * taps give a spring response, because a parent is filling this in one-handed.
 */

export const inputClass =
  "min-h-14 w-full rounded-2xl border border-white/15 bg-white/5 px-4 font-body text-base text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold focus:bg-white/10";

export const textareaClass =
  "min-h-28 w-full rounded-2xl border border-white/15 bg-white/5 p-4 font-body text-base text-cream placeholder:text-cream/35 outline-none transition-colors focus:border-gold focus:bg-white/10";

export const selectClass =
  "min-h-14 rounded-2xl border border-white/15 bg-white/5 px-3 font-body text-base text-cream outline-none focus:border-gold";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-left">
      <span className="mb-2 block font-body text-sm font-bold text-cream/85">
        {label}
      </span>
      {children}
      <AnimatePresence>
        {error ? (
          <m.span
            className="mt-1.5 block font-body text-sm text-tab-pink"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
          >
            {error}
          </m.span>
        ) : hint ? (
          <span className="mt-1.5 block font-body text-xs text-cream/45">{hint}</span>
        ) : null}
      </AnimatePresence>
    </label>
  );
}

/** A big tappable card — the main way answers get given in this flow. */
export function BigChoice({
  emoji,
  label,
  sublabel,
  selected,
  onSelect,
}: {
  emoji: string;
  label: string;
  sublabel?: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <m.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      aria-pressed={selected}
      className={`flex min-h-20 w-full items-center gap-4 rounded-3xl border-2 px-5 py-4 text-left transition-colors ${
        selected
          ? "border-gold bg-gold/15"
          : "border-white/15 bg-white/5 hover:border-white/30"
      }`}
    >
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="flex-1">
        <span className="block font-display text-lg font-semibold text-cream">
          {label}
        </span>
        {sublabel ? (
          <span className="block font-body text-sm text-cream/60">{sublabel}</span>
        ) : null}
      </span>
    </m.button>
  );
}

/** Minus / value / plus. The number springs in the direction it moved. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 12,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  const button =
    "flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 font-display text-2xl text-cream disabled:opacity-30";

  return (
    <div className="flex items-center justify-center gap-6">
      <m.button
        type="button"
        className={button}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`One fewer ${label}`}
      >
        −
      </m.button>

      <span className="relative block h-14 w-16 overflow-hidden text-center">
        <AnimatePresence initial={false}>
          <m.span
            key={value}
            className="absolute inset-0 flex items-center justify-center font-display text-5xl font-bold text-gold-gradient tabular-nums"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            {value}
          </m.span>
        </AnimatePresence>
      </span>

      <m.button
        type="button"
        className={button}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`One more ${label}`}
      >
        +
      </m.button>
    </div>
  );
}

/** The sticker a child picks — it prints on their name tag later. */
export function StickerPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATARS.map((avatar, i) => {
        const selected = avatar.id === value;
        return (
          <m.button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.id)}
            title={avatar.label}
            aria-label={avatar.label}
            aria-pressed={selected}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 18,
              delay: i * 0.025,
            }}
            whileTap={{ scale: 0.85 }}
            className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-2xl transition-colors ${
              selected ? "border-gold bg-gold/20" : "border-white/10 bg-white/5"
            }`}
          >
            <span aria-hidden="true">{avatar.emoji}</span>
          </m.button>
        );
      })}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <m.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      className="flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-gold-soft via-gold to-gold-deep px-6 font-display text-lg font-bold text-ink shadow-lg shadow-gold/20 disabled:opacity-50"
    >
      {children}
    </m.button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 font-body text-sm text-cream/50 underline underline-offset-4 hover:text-cream/80"
    >
      Back
    </button>
  );
}
