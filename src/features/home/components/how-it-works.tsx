import { Building, DoorOpen, Layers3 } from "lucide-react";

import { Section } from "@/components/layout/section";

const STEPS = [
  {
    icon: Building,
    title: "Explore the building",
    body: "Orbit a 3D model of the whole development and get a feel for its scale and layout.",
  },
  {
    icon: Layers3,
    title: "Choose a floor",
    body: "Hover to compare levels, then pick one to see every apartment on it and what's available.",
  },
  {
    icon: DoorOpen,
    title: "Step inside",
    body: "Open an apartment to switch between its 2D plan and a 3D walkthrough, then send an inquiry.",
  },
] as const;

/** Explains the journey. Target of the "About" navigation link (#about). */
export function HowItWorks() {
  return (
    <Section id="about" aria-labelledby="about-heading" className="scroll-mt-header">
      <div className="max-w-prose-narrow">
        <p className="text-sm font-medium tracking-wide text-forest-700 uppercase">About HomeMe</p>
        <h2 id="about-heading" className="mt-4 text-4xl md:text-5xl">
          From skyline to floor plan in three steps.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          HomeMe is a demo of how buyers could explore a new development before it&apos;s built.
          Every measurement is marked as verified or estimated, so you always know what&apos;s
          exact.
        </p>
      </div>

      <ol className="mt-stack grid gap-10 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <span className="font-display text-sm text-muted-foreground">0{index + 1}</span>
              <Icon aria-hidden className="size-5 text-forest-700" />
            </div>
            <h3 className="mt-4 text-2xl">{title}</h3>
            <p className="mt-2 text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
