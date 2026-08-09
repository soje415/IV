import { EVENT } from "@/config/event";
import { Reveal } from "@/components/reveal";

/**
 * The venue on a map.
 *
 * The host supplied Google's embed snippet at a fixed 400×300, which would
 * overflow a 360px phone. Same URL, but the frame fills its column and holds a
 * 4:3 box, so it never forces a horizontal scroll.
 *
 * `loading="lazy"` matters here: this sits well below the fold and the iframe
 * is by far the heaviest thing on the page. The text link above it is what
 * actually gets guests there — the map is orientation, not navigation.
 */
export function VenueMap() {
  if (!EVENT.venue.embedUrl) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-16 sm:pb-24">
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <iframe
            src={EVENT.venue.embedUrl}
            title={`Map to ${EVENT.venue.name}`}
            className="aspect-[4/3] w-full border-0 sm:aspect-[21/9]"
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </Reveal>

      {EVENT.venue.mapUrl ? (
        <Reveal delay={0.06}>
          <a
            href={EVENT.venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 font-body text-sm font-bold text-cream sm:mx-auto sm:max-w-xs"
          >
            📍 Get directions
          </a>
        </Reveal>
      ) : null}
    </section>
  );
}
