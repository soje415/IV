"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Loads only the DOM animation feature set (~5kb instead of ~34kb) and honours
 * the OS "reduce motion" setting everywhere at once.
 *
 * `strict` means components must use `m.*`, never `motion.*` — the latter would
 * silently pull the full bundle back in.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
