"use client";

import { AnimatePresence, m } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { signOut } from "@/app/door/actions";
import { ArrivalSheet } from "@/components/door/arrival-sheet";
import { useArrivals } from "@/components/door/use-arrivals";
import { inputClass } from "@/components/rsvp/ui";
import { EVENT } from "@/config/event";
import { type DoorFamily, matchesQuery } from "@/lib/door";

/**
 * Tap-the-name check-in.
 *
 * Built for one hand, dim light and a tired volunteer: rows are 72px, nothing
 * is smaller than 14px, and the only destructive-feeling control on screen is
 * behind the sheet.
 */

export const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: EVENT.timeZone,
});

export function DoorList({ families }: { families: DoorFamily[] }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { arrivals, pending, expired, mark } = useArrivals();

  // The server knows about every bouncer's taps; the local cache only knows
  // about this phone's. Whichever has a time wins, server first.
  const withArrival = useMemo(
    () =>
      families.map((family) => ({
        ...family,
        arrivedAt: family.arrivedAt ?? arrivals[family.id] ?? null,
      })),
    [families, arrivals],
  );

  const shown = useMemo(
    () => withArrival.filter((family) => matchesQuery(family, query)),
    [withArrival, query],
  );

  const arrived = withArrival.filter((family) => family.arrivedAt !== null).length;
  const open = openId ? withArrival.find((f) => f.id === openId) ?? null : null;

  // Stable so the sheet's auto-close timer isn't restarted by every render.
  const close = useCallback(() => setOpenId(null), []);

  return (
    <div className="mx-auto w-full max-w-lg pb-24">
      {/* safe-t, not pt-4: viewportFit is "cover", so on a notched phone a
          plain top padding puts the arrival counter under the status bar. */}
      <header className="safe-t sticky top-0 z-20 border-b border-white/10 bg-ink/95 px-4 pb-3 backdrop-blur">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-xl font-bold text-cream tabular-nums">
            {arrived}{" "}
            <span className="font-body text-sm font-normal text-cream/55">
              of {withArrival.length} families in
            </span>
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="min-h-11 font-body text-sm text-cream/50 underline underline-offset-4"
            >
              Sign out
            </button>
          </form>
        </div>

        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="presentation"
        >
          <m.div
            className="h-full rounded-full bg-tab-mint"
            initial={false}
            animate={{
              width: `${withArrival.length ? (arrived / withArrival.length) * 100 : 0}%`,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 30 }}
          />
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={`${inputClass} mt-3`}
          type="search"
          inputMode="search"
          autoComplete="off"
          aria-label="Search for a family or child"
          placeholder="Search a family or child…"
        />

        {expired ? (
          <p
            className="mt-2 rounded-xl bg-tab-pink/15 px-3 py-2 font-body text-sm text-tab-pink"
            role="alert"
          >
            Your session expired. Reload and enter the PIN again.
          </p>
        ) : pending.length > 0 ? (
          <p className="mt-2 font-body text-sm text-gold" role="status">
            ↻ {pending.length} waiting for signal — they&apos;ll save
            automatically.
          </p>
        ) : null}
      </header>

      <ul className="px-4">
        {shown.map((family) => (
          <li key={family.id}>
            <FamilyRow
              family={family}
              unsynced={pending.includes(family.id)}
              onOpen={() => setOpenId(family.id)}
            />
          </li>
        ))}
      </ul>

      {shown.length === 0 ? (
        <p className="px-4 pt-10 text-center font-body text-base text-cream/50">
          {withArrival.length === 0
            ? "Nobody on the list yet."
            : `No family matching “${query}”.`}
        </p>
      ) : null}

      <AnimatePresence>
        {open ? (
          <ArrivalSheet
            family={open}
            unsynced={pending.includes(open.id)}
            onMark={() => mark(open.id)}
            onClose={close}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FamilyRow({
  family,
  unsynced,
  onOpen,
}: {
  family: DoorFamily;
  unsynced: boolean;
  onOpen: () => void;
}) {
  const here = family.arrivedAt !== null;

  return (
    <m.button
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.98 }}
      className={`mt-2 flex min-h-[72px] w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
        here
          ? "border-tab-mint/50 bg-tab-mint/12"
          : "border-white/12 bg-white/5"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-lg font-bold text-cream">
          {family.familyName}
        </span>
        <span className="mt-0.5 block font-body text-sm text-cream/65">
          {family.adults} {family.adults === 1 ? "adult" : "adults"}
          {family.children > 0
            ? ` · ${family.children} ${family.children === 1 ? "child" : "children"}`
            : ""}
          {family.allergies.length > 0 ? (
            <span className="font-bold text-tab-pink"> · ⚠ allergy</span>
          ) : null}
        </span>
      </span>

      {here ? (
        <span className="shrink-0 text-right font-body text-sm font-bold text-tab-mint">
          <span className="block text-xl leading-none" aria-hidden="true">
            ✓
          </span>
          <span className="mt-1 block tabular-nums">
            {unsynced ? "saving…" : timeFmt.format(new Date(family.arrivedAt!))}
          </span>
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-2 font-body text-sm font-bold text-cream/70 tabular-nums">
          🎁 {family.goodieBags}
        </span>
      )}
    </m.button>
  );
}
