import Link from "next/link";

/**
 * The two ways in to the private side of the site.
 *
 * Both land on a PIN screen, so nothing here is a leak — the PIN, not the
 * secrecy of the URL, is what guards the guest list.
 *
 * It floats over the hero, whose left panel is top-aligned on a phone. The
 * panel therefore reserves matching clearance (see split-hero) so this never
 * lands on top of Tabitha's name.
 */
export function TopNav() {
  const link =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-tab-deep/25 bg-cream/70 px-3 font-body text-[10px] font-bold tracking-[0.15em] text-tab-deep uppercase backdrop-blur-sm transition-colors hover:border-tab-deep/60 md:border-white/25 md:bg-ink/40 md:text-cream/80 md:hover:text-cream";

  return (
    <nav
      className="safe-t absolute inset-x-0 top-0 z-30 flex justify-end gap-2 px-4"
      aria-label="Organiser pages"
    >
      <Link href="/admin" className={link}>
        <span aria-hidden="true">🔐</span>
        Admin
      </Link>
      {/* The route stays /door; "Security" is what the people working it are
          called, and it is shorter than "Bouncers" beside "Admin" on a phone. */}
      <Link href="/door" className={link}>
        <span aria-hidden="true">🚪</span>
        Security
      </Link>
    </nav>
  );
}
