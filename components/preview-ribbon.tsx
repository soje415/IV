import { DETAILS_CONFIRMED } from "@/config/event";

/**
 * Shown until every TODO(host) in config/event.ts is filled in, so a link
 * shared early can never quietly give a guest the wrong date or venue.
 */
export function PreviewRibbon() {
  if (DETAILS_CONFIRMED) return null;

  return (
    <div className="relative z-30 bg-gold px-4 py-2 text-center font-body text-xs font-bold text-ink sm:text-sm">
      PREVIEW — date, venue and other details are placeholders and not yet final
    </div>
  );
}
