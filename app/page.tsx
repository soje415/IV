import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { Curtain } from "@/components/curtain";
import { Details } from "@/components/details";
import { Balloons } from "@/components/particles";
import { PreviewRibbon } from "@/components/preview-ribbon";
import { Reveal } from "@/components/reveal";
import { RsvpFlow } from "@/components/rsvp/rsvp-flow";
import { SplitHero } from "@/components/split-hero";
import { StickyRsvpBar } from "@/components/sticky-rsvp-bar";
import { TopNav } from "@/components/top-nav";
import { CELEBRANTS } from "@/config/event";

/**
 * Rendered per request, not at build time.
 *
 * The preview ribbon asks whether a database is actually bound, and that answer
 * only exists inside a request on Cloudflare. Prerendering would freeze
 * "RSVPs are not being saved yet" into the page forever.
 */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Curtain />
      <PreviewRibbon />
      <TopNav />
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
            <h2 className="font-display text-3xl font-bold text-cream sm:text-4xl">
              Let us know you&apos;re coming
            </h2>
            <p className="mt-3 font-body text-sm text-cream/65 sm:text-base">
              A few quick questions, then your pass is ready.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8 text-left">
              <RsvpFlow />
            </div>
          </Reveal>
        </section>

        <footer className="relative border-t border-white/10 px-5 py-8 text-center">
          <p className="font-body text-xs text-cream/40">
            Made with love for {CELEBRANTS.tabitha.firstName} &amp;{" "}
            {CELEBRANTS.abraham.firstName}
          </p>
          <p className="mt-1.5 font-body text-[10px] tracking-[0.2em] text-cream/30 uppercase">
            Powered by Bond Sustainable
          </p>
          {/*
            The host's way in. In the footer because guests have no reason to
            tap it, but a real button rather than a faint link — the PIN, not
            obscurity, is what guards the guest list, and the host has to be
            able to find this on a phone without hunting.
          */}
          <Link
            href="/admin"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 font-body text-xs font-bold tracking-[0.2em] text-cream/70 uppercase transition-colors hover:border-gold/50 hover:text-cream"
          >
            <span aria-hidden="true">🔐</span>
            Admin
          </Link>
        </footer>
      </main>

      <StickyRsvpBar />
    </>
  );
}
