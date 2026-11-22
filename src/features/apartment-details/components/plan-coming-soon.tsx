import { PencilRuler } from "lucide-react";

/** Shown instead of the 2D/3D viewer when a unit has no detailed layout yet. */
export function PlanComingSoon({ apartmentNumber }: { apartmentNumber: string }) {
  return (
    <div
      role="status"
      data-testid="plan-coming-soon"
      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-stone-400 bg-stone-100 p-8 text-center"
    >
      <PencilRuler aria-hidden className="size-8 text-forest-700" />
      <p className="font-display text-2xl">Floor plan coming soon</p>
      <p className="max-w-prose-narrow text-muted-foreground">
        The detailed layout and 3D model for apartment {apartmentNumber} are being prepared. Ask us
        and we&apos;ll send it as soon as it&apos;s ready.
      </p>
    </div>
  );
}
