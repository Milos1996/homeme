"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Soft ease-out shared by every Motion animation (matches the `--ease-out-soft` token). */
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

/**
 * App-wide Motion defaults. `reducedMotion="user"` makes every Motion
 * component honour `prefers-reduced-motion`: transforms and layout
 * animations are skipped, only opacity fades remain.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease: EASE_OUT_SOFT }}>
      {children}
    </MotionConfig>
  );
}
