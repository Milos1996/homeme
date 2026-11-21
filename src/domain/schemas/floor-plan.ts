import { z } from "zod";

import { segmentLength } from "../geometry/segment";
import type { FloorPlan, Opening, Point2, Room, Wall } from "../types";
import { LengthSchema, PositiveLengthSchema } from "./provenance";

export const Point2Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
}) satisfies z.ZodType<Point2>;

export const PolygonSchema = z.array(Point2Schema).min(3, "A polygon needs at least 3 points");

export const RoomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum([
    "living",
    "kitchen",
    "dining",
    "bedroom",
    "bathroom",
    "wc",
    "hallway",
    "storage",
    "balcony",
    "other",
  ]),
  polygon: PolygonSchema,
}) satisfies z.ZodType<Room>;

export const WallSchema = z
  .object({
    id: z.string().min(1),
    start: Point2Schema,
    end: Point2Schema,
    thickness: PositiveLengthSchema,
    height: PositiveLengthSchema,
    exterior: z.boolean(),
  })
  .refine((w) => segmentLength(w.start, w.end) > 0, {
    message: "Wall start and end must differ",
    path: ["end"],
  }) satisfies z.ZodType<Wall>;

export const OpeningSchema = z.object({
  id: z.string().min(1),
  wallId: z.string().min(1),
  kind: z.enum(["door", "window"]),
  offset: LengthSchema,
  width: PositiveLengthSchema,
  height: PositiveLengthSchema,
  sillHeight: LengthSchema,
}) satisfies z.ZodType<Opening>;

/** Validates a floor plan, including references and that openings fit inside their walls. */
export const FloorPlanSchema = z
  .object({
    rooms: z.array(RoomSchema),
    walls: z.array(WallSchema),
    openings: z.array(OpeningSchema),
  })
  .superRefine((plan, ctx) => {
    const walls = new Map(plan.walls.map((w) => [w.id, w]));

    plan.openings.forEach((opening, index) => {
      const wall = walls.get(opening.wallId);
      if (!wall) {
        ctx.addIssue({
          code: "custom",
          message: `Opening "${opening.id}" references unknown wall "${opening.wallId}"`,
          path: ["openings", index, "wallId"],
        });
        return;
      }

      const length = segmentLength(wall.start, wall.end);
      if (opening.offset.value + opening.width.value > length) {
        ctx.addIssue({
          code: "custom",
          message: `Opening "${opening.id}" runs past the end of wall "${wall.id}"`,
          path: ["openings", index, "width"],
        });
      }

      if (opening.sillHeight.value + opening.height.value > wall.height.value) {
        ctx.addIssue({
          code: "custom",
          message: `Opening "${opening.id}" is taller than wall "${wall.id}"`,
          path: ["openings", index, "height"],
        });
      }
    });
  }) satisfies z.ZodType<FloorPlan>;
