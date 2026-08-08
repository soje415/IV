"use client";

import { m } from "motion/react";
import { useState, useTransition } from "react";
import { signIn } from "@/app/admin/actions";
import { inputClass } from "@/components/rsvp/ui";

export function PinGate() {
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
        🔐
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold text-cream">
        Host dashboard
      </h1>
      <p className="mt-2 font-body text-sm text-cream/60">
        Enter the PIN to see the guest list.
      </p>

      <input
        value={pin}
        onChange={(event) => setPin(event.target.value)}
        className={`${inputClass} mt-6 text-center text-2xl tracking-[0.5em]`}
        inputMode="numeric"
        autoComplete="off"
        maxLength={12}
        aria-label="Dashboard PIN"
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
