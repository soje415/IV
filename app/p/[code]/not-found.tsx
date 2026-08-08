import Link from "next/link";
import { CELEBRANTS } from "@/config/event";

/** Shown for a code that was mistyped, guessed, or belongs to no one. */
export default function PassNotFound() {
  const { tabitha, abraham } = CELEBRANTS;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <span className="text-5xl" aria-hidden="true">
        🎟️
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-cream">
        We can&apos;t find that pass
      </h1>
      <p className="mt-3 font-body text-sm text-cream/65">
        The link may have been mistyped, or the pass belongs to a different
        party. Check the link you were sent, or RSVP again to get a fresh pass.
      </p>
      <Link
        href="/#rsvp"
        className="mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-gold-soft via-gold to-gold-deep px-6 font-display text-base font-bold text-ink"
      >
        Go to the invite
      </Link>
      <p className="mt-6 font-body text-[10px] tracking-[0.25em] text-cream/35 uppercase">
        {tabitha.firstName} &amp; {abraham.firstName} · {tabitha.turning} &amp;{" "}
        {abraham.turning}
      </p>
    </main>
  );
}
