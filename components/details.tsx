import {
  EVENT,
  eventDateLabel,
  eventTimeLabel,
  rsvpDeadlineLabel,
} from "@/config/event";
import { VenueMap } from "@/components/map";
import { Reveal } from "@/components/reveal";

interface Card {
  icon: string;
  title: string;
  lines: string[];
  href?: string;
  hrefLabel?: string;
}

function DetailCard({ card, delay }: { card: Card; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:border-gold/40 sm:p-6">
        <span className="text-3xl" aria-hidden="true">
          {card.icon}
        </span>
        <h3 className="mt-3 font-display text-lg font-semibold text-gold sm:text-xl">
          {card.title}
        </h3>
        <div className="mt-1.5 space-y-0.5">
          {card.lines.map((line) => (
            <p key={line} className="font-body text-sm text-cream/75 sm:text-base">
              {line}
            </p>
          ))}
        </div>
        {card.href ? (
          <a
            href={card.href}
            className="mt-4 inline-flex min-h-11 items-center font-body text-sm font-bold text-gold underline underline-offset-4 hover:text-gold-soft"
          >
            {card.hrefLabel}
          </a>
        ) : null}
      </div>
    </Reveal>
  );
}

export function Details() {
  const cards: Card[] = [
    {
      icon: "📅",
      title: "When",
      lines: [eventDateLabel(), eventTimeLabel()],
    },
    {
      icon: "📍",
      title: "Where",
      lines: [EVENT.venue.name, EVENT.venue.address],
      href: EVENT.venue.mapUrl || undefined,
      hrefLabel: "Open in Maps",
    },
    {
      icon: "👕",
      title: "What to wear",
      lines: [EVENT.dressCode],
    },
    {
      icon: "🎁",
      title: "Gifts",
      lines: [EVENT.giftPolicy],
    },
  ];

  // Both of these are omissions the host chose. An empty card that says a
  // detail is "coming soon" reads as an unfinished site, not a decision.
  const deadline = rsvpDeadlineLabel();
  if (deadline) {
    cards.push({
      icon: "⏳",
      title: "RSVP by",
      lines: [deadline, "So we can count cake and party bags"],
    });
  }

  if (EVENT.hostPhone) {
    cards.push({
      icon: "💬",
      title: "Questions",
      lines: [EVENT.hostName, EVENT.hostPhone],
      href: `tel:${EVENT.hostPhone.replace(/\s/g, "")}`,
      hrefLabel: "Call us",
    });
  }

  return (
    <section id="details" className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
      <Reveal>
        <h2 className="text-center font-display text-3xl font-bold text-cream sm:text-4xl">
          Everything you need to know
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <DetailCard key={card.title} card={card} delay={i * 0.06} />
        ))}
        {/* The map is just another card, sized like the rest of them. */}
        <VenueMap delay={cards.length * 0.06} />
      </div>
    </section>
  );
}
