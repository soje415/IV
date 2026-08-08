"use client";

import { m } from "motion/react";
import { useState, useTransition } from "react";
import { inputClass } from "@/components/rsvp/ui";

/**
 * The PIN prompt in front of /admin and /door.
 *
 * The sign-in call is passed in rather than imported, so this file stays free
 * of any server action and both gates share one keypad.
 */
export function PinGate({
  emoji,
  title,
  blurb,
  signIn,
}: {
  emoji: string;
  title: string;
  blurb: string;
  signIn: (pin: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await signIn(pin);
      if (!result.ok) {
        setError(result.error ?? "That didn't work.");
        setPin("");
      }
    });
  };

  return (
    <m.form
      className="mx-auto w-full max-w-xs text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <span className="text-4xl" aria-hidden="true">
        {emoji}
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold text-cream">{title}</h1>
      <p className="mt-2 font-body text-sm text-cream/60">{blurb}</p>

      <input
        value={pin}
        onChange={(event) => setPin(event.target.value)}
        className={`${inputClass} mt-6 text-center text-2xl tracking-[0.5em]`}
        inputMode="numeric"
        autoComplete="off"
        maxLength={12}
        aria-label={`${title} PIN`}
        placeholder="••••"
      />

      {error ? (
        <p className="mt-3 font-body text-sm text-tab-pink" role="alert">
          {error}
        </p>
      ) : null}

      <m.button
        type="submit"
        disabled={pending || pin.length === 0}
        whileTap={{ scale: 0.97 }}
        className="mt-5 flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-gold-soft via-gold to-gold-deep font-display text-base font-bold text-ink disabled:opacity-50"
      >
        {pending ? "Checking…" : "Unlock"}
      </m.button>
    </m.form>
  );
}

/**
 * Shown when a role has no PIN configured in production. Locking the page beats
 * falling back to a guessable default on a screen listing children's names.
 */
export function NoPinConfigured({
  title,
  envVar,
}: {
  title: string;
  envVar: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-20 text-center">
      <span className="text-4xl" aria-hidden="true">
        🔒
      </span>
      <h1 className="mt-4 font-display text-xl font-bold text-cream">{title}</h1>
      <p className="mt-3 font-body text-sm text-cream/65">
        No <code className="text-gold">{envVar}</code> is set for this
        deployment. Set one and redeploy:
      </p>
      <code className="mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-xs text-cream/80">
        npx wrangler secret put {envVar}
      </code>
    </div>
  );
}
