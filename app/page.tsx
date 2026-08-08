import { Countdown } from "@/components/countdown";
import { Curtain } from "@/components/curtain";
import { Details } from "@/components/details";
import { Balloons } from "@/components/particles";
import { PreviewRibbon } from "@/components/preview-ribbon";
import { Reveal } from "@/components/reveal";
import { SplitHero } from "@/components/split-hero";
import { StickyRsvpBar } from "@/components/sticky-rsvp-bar";
import { CELEBRANTS } from "@/config/event";

export default function Home() {
  return (
    <>
      <Curtain />
      <PreviewRibbon />
      <SplitHero />

      {/* Everything below the hero shares one balloon-filled backdrop. */}
      <main className="relative isolate overflow-hidden">
        <Balloons />

        <section className="relative mx-auto w-full max-w-3xl px-5 pt-16 text-center sm:pt-24">
          <Reveal>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-cream/50 sm:text-sm">
              The countdown is on
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-6 sm:mt-8">
              <Countdown />
            </div>
          </Reveal>
        </section>

        <Details />

        <section
          id="rsvp"
          className="relative mx-auto w-full max-w-2xl scroll-mt-8 px-5 pb-24 text-center"
        >
          <Reveal>
            <div className="rounded-3xl border border-dashed border-gold/40 bg-white/5 p-8 sm:p-12">
              <span className="text-4xl" aria-hidden="true">
                🎟️
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold text-cream sm:text-3xl">
                Your family pass
              </h2>
              <p className="mt-3 font-body text-sm text-cream/70 sm:text-base">
                The RSVP form and Golden Ticket pass land in the next build
                phase. Tell us who&apos;s coming, and we&apos;ll hand you a pass
                to show at the door.
              </p>
            </div>
          </Reveal>
        </section>

        <footer className="relative border-t border-white/10 px-5 py-8 text-center">
          <p className="font-body text-xs text-cream/40">
            Made with love for {CELEBRANTS.tabitha.firstName} &amp;{" "}
            {CELEBRANTS.abraham.firstName}
          </p>
        </footer>
      </main>

      <StickyRsvpBar />
    </>
  );
}
