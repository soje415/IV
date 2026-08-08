import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CELEBRANTS } from "@/config/event";
import { db } from "@/lib/db";
import { isSignedIn } from "@/lib/gate";
import { avatarById } from "@/lib/types";

/**
 * A printable sheet of name tags, one per child, with the sticker they chose
 * when their family RSVP'd.
 *
 * Tags render white-on-paper even on screen, so what you see is what comes out
 * of the printer.
 */

export const metadata: Metadata = {
  title: "Name tags",
  robots: { index: false, follow: false },
};

export default async function NameTagsPage() {
  if (!(await isSignedIn("host"))) redirect("/admin");

  const rsvps = await db.listRsvps();
  const tags = rsvps
    .filter((rsvp) => rsvp.attending)
    .flatMap((rsvp) =>
      rsvp.children.map((child) => ({
        key: child.id,
        name: child.name,
        emoji: avatarById(child.avatar).emoji,
        team: rsvp.team,
      })),
    );

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">
            Name tags
          </h1>
          <p className="mt-1 font-body text-sm text-cream/55">
            {tags.length} {tags.length === 1 ? "child" : "children"} · 10 per A4
            sheet. Print, then cut along the edges.
          </p>
        </div>
        <Link
          href="/admin"
          className="min-h-11 rounded-full border border-white/15 px-4 py-2.5 font-body text-sm text-cream/70"
        >
          ← Back
        </Link>
      </div>

      {tags.length === 0 ? (
        <p className="no-print font-body text-sm text-cream/50">
          No children on the list yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tags.map((tag) => (
            <div
              key={tag.key}
              className="flex h-[5.4cm] break-inside-avoid items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-300 bg-white px-5"
            >
              <span className="text-5xl" aria-hidden="true">
                {tag.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-body text-[10px] tracking-[0.2em] text-neutral-400 uppercase">
                  Hello, my name is
                </span>
                <span className="mt-1 block font-display text-3xl leading-tight font-bold break-words text-neutral-900">
                  {tag.name}
                </span>
                <span className="mt-1 block font-body text-[10px] text-neutral-400">
                  {CELEBRANTS.tabitha.firstName} &amp;{" "}
                  {CELEBRANTS.abraham.firstName} ·{" "}
                  {CELEBRANTS.tabitha.turning} &amp;{" "}
                  {CELEBRANTS.abraham.turning}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`h-full w-2 rounded-full ${
                  tag.team === "abraham"
                    ? "bg-abe-blue"
                    : tag.team === "tabitha"
                      ? "bg-tab-pink"
                      : "bg-gold"
                }`}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
