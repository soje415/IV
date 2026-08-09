import { EVENT } from "@/config/event";
import { Reveal } from "@/components/reveal";

/**
 * The venue on a map — one card in the details grid, the same size as the rest.
 *
 * The host supplied Google's embed at a fixed 400×300, which overflows a 360px
 * phone. Same URL, but the frame fills its column and holds a 4:3 box, so it
 * never forces a horizontal scroll and never dwarfs the cards beside it.
 *
 * `loading="lazy"` matters: this sits well below the fold and the iframe is by
 * far the heaviest thing on the page. The directions link is what actually gets
 * guests there — the map is orientation, not navigation.
 */
export function VenueMap({ delay = 0 }: { delay?: number }) {
  if (!EVENT.venue.embedUrl) return null;

  return (
    <Reveal delay={delay} className="h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <iframe
          src={EVENT.venue.embedUrl}
          title={`Map to ${EVENT.venue.name}`}
          className="aspect-[4/3] w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />

        {EVENT.venue.mapUrl ? (
          <a
            href={EVENT.venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center border-t border-white/10 font-body text-sm font-bold text-gold hover:text-gold-soft"
          >
            📍 Get directions
          </a>
        ) : null}
      </div>
    </Reveal>
  );
}
