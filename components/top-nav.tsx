import Link from "next/link";

/**
 * The two ways in to the private side of the site.
 *
 * Both land on a PIN screen, so nothing here is a leak — the PIN, not the
 * secrecy of the URL, is what guards the guest list. Kept small and set over
 * the hero so it never competes with the invitation itself.
 */
export function TopNav() {
  const link =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 bg-ink/40 px-4 font-body text-[11px] font-bold tracking-[0.18em] text-cream/75 uppercase backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-cream";

  return (
    <nav
      className="safe-t absolute inset-x-0 top-0 z-30 flex justify-end gap-2 px-4 pb-2"
      aria-label="Organiser pages"
    >
      <Link href="/admin" className={link}>
        <span aria-hidden="true">🔐</span>
        Admin
      </Link>
      <Link href="/door" className={link}>
        <span aria-hidden="true">🚪</span>
        Door
      </Link>
    </nav>
  );
}
