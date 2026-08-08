import { DETAILS_CONFIRMED } from "@/config/event";
import { isEphemeral } from "@/lib/db";

/**
 * Warns while the site is not yet safe to send to guests.
 *
 * Two separate hazards: event details that are still placeholders, and a
 * deployment with no database behind it, where an RSVP looks accepted but is
 * gone on the next request. Either one means a shared link would mislead
 * someone, so it stays visible until both are sorted.
 */
export async function PreviewRibbon() {
  const noDatabase = await isEphemeral();
  if (DETAILS_CONFIRMED && !noDatabase) return null;

  const problems = [
    !DETAILS_CONFIRMED ? "date and venue are placeholders" : null,
    noDatabase ? "RSVPs are not being saved yet" : null,
  ].filter(Boolean);

  return (
    <div className="relative z-30 bg-gold px-4 py-2 text-center font-body text-xs font-bold text-ink sm:text-sm">
      PREVIEW — {problems.join(" · ")}
    </div>
  );
}
