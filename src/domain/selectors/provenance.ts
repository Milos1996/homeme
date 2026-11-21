import type { Dimension, FloorPlan, MeasureUnit, Provenance } from "../types";

/** Every dimension in a floor plan (wall thickness/height and opening measurements). */
export function floorPlanDimensions(plan: FloorPlan): Dimension<MeasureUnit>[] {
  return [
    ...plan.walls.flatMap((w) => [w.thickness, w.height]),
    ...plan.openings.flatMap((o) => [o.offset, o.width, o.height, o.sillHeight]),
  ];
}

/** Counts dimensions by provenance, e.g. to show "12 of 40 dimensions verified". */
export function countProvenance(
  dimensions: readonly Dimension<MeasureUnit>[],
): Record<Provenance, number> {
  const counts: Record<Provenance, number> = { verified: 0, estimated: 0 };
  for (const d of dimensions) counts[d.provenance] += 1;
  return counts;
}

/** A plan is only "verified" when every one of its dimensions is verified. */
export function isFullyVerified(plan: FloorPlan): boolean {
  const dims = floorPlanDimensions(plan);
  return dims.length > 0 && dims.every((d) => d.provenance === "verified");
}
