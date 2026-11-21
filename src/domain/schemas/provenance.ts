import { z } from "zod";

import type { Area, Length } from "../types";

export const ProvenanceSchema = z.enum(["verified", "estimated"]);

const dimensionBase = {
  provenance: ProvenanceSchema,
  source: z.string().min(1).exactOptional(),
};

/** A non-negative length in metres with provenance. */
export const LengthSchema = z.object({
  value: z.number().finite().nonnegative(),
  unit: z.literal("m"),
  ...dimensionBase,
}) satisfies z.ZodType<Length>;

/** A positive area in square metres with provenance. */
export const AreaSchema = z.object({
  value: z.number().finite().positive(),
  unit: z.literal("m2"),
  ...dimensionBase,
}) satisfies z.ZodType<Area>;

/** A strictly positive length (thickness, width, height). */
export const PositiveLengthSchema = LengthSchema.refine((d) => d.value > 0, {
  message: "Must be greater than 0",
  path: ["value"],
});
