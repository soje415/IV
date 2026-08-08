"use client";

import { m } from "motion/react";
import { useState, type RefObject } from "react";
import { downloadIcs } from "@/lib/ics";
import { passFileName, passUrl, whatsappHref, type PassData } from "@/lib/pass";
import { useOrigin } from "@/lib/use-origin";

/**
 * What a guest can do with their pass once they have it.
 *
 * Deliberately not Apple Wallet — a real Wallet pass needs a paid Apple
 * Developer certificate. A PNG, a calendar file and a WhatsApp link cover what
 * people actually do (PLAN.md §1).
 */

type Status = "idle" | "working" | "saved" | "failed";

export function PassActions({
  pass,
  captureRef,
  onCaptureStart,
  onCaptureEnd,
}: {
  pass: PassData;
  captureRef: RefObject<HTMLDivElement | null>;
  onCaptureStart: () => void;
  onCaptureEnd: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const origin = useOrigin();

  const savePng = async () => {
    const node = captureRef.current;
    if (!node) return;

    setStatus("working");
    onCaptureStart();
    try {
      // Let the shimmer unmount before we snapshot the card.
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const { domToPng } = await import("modern-screenshot");
      // 3x so it stays sharp after WhatsApp re-compresses it.
      const dataUrl = await domToPng(node, { scale: 3, backgroundColor: "#140d24" });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = passFileName(pass);
      link.click();
      setStatus("saved");
    } catch {
      setStatus("failed");
    } finally {
      onCaptureEnd();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(passUrl(pass.passCode, origin));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <m.button
        type="button"
        onClick={savePng}
        disabled={status === "working"}
        whileTap={{ scale: 0.97 }}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-soft via-gold to-gold-deep px-6 font-display text-base font-bold text-ink disabled:opacity-60"
      >
        {status === "working" ? "Making your pass…" : "⬇︎ Save pass as image"}
      </m.button>

      <div className="grid grid-cols-2 gap-3">
        <SecondaryLink href={whatsappHref(pass, origin)}>
          💬 WhatsApp
        </SecondaryLink>
        <SecondaryButton onClick={() => downloadIcs(pass, origin)}>
          📅 Add to calendar
        </SecondaryButton>
      </div>

      <button
        type="button"
        onClick={copyLink}
        className="min-h-11 w-full font-body text-sm text-cream/50 underline underline-offset-4 hover:text-cream/80"
      >
        {copied ? "Link copied ✓" : "Copy pass link"}
      </button>

      <p className="text-center font-body text-xs text-cream/40" role="status">
        {status === "failed"
          ? "That didn't work — screenshot the pass instead, or use the link above."
          : "On iPhone the image may open in a new tab — press and hold it to save."}
      </p>
    </div>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="flex min-h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-3 font-body text-sm font-bold text-cream"
    >
      {children}
    </m.button>
  );
}

function SecondaryLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-3 font-body text-sm font-bold text-cream active:scale-[0.97]"
    >
      {children}
    </a>
  );
}
