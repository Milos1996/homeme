import type { ReactNode } from "react";

/**
 * Gentle rise-in for each route (used by app/template.tsx, which remounts
 * on navigation so the animation replays). Pure CSS, so it works before
 * hydration and the global `prefers-reduced-motion` rule turns it off.
 * It only animates opacity and transform, so it causes no layout shift.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div
      data-page-transition
      className="flex flex-1 animate-in flex-col duration-500 ease-out-soft fade-in-50 slide-in-from-bottom-2 motion-reduce:animate-none"
    >
      {children}
    </div>
  );
}
