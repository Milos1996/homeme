import { z } from "zod";

import type { Apartment, Building, Floor, Price, Project } from "../types";
import { FloorPlanSchema, PolygonSchema } from "./floor-plan";
import { AreaSchema, LengthSchema, PositiveLengthSchema } from "./provenance";

export const AvailabilitySchema = z.enum(["available", "reserved", "sold"]);

export const PriceSchema = z.object({
  amount: z.number().finite().positive(),
  currency: z.string().regex(/^[A-Z]{3}$/, "Use an ISO 4217 code, e.g. EUR"),
}) satisfies z.ZodType<Price>;

export const ApartmentSchema = z.object({
  id: z.string().min(1),
  floorId: z.string().min(1),
  number: z.string().min(1),
  area: AreaSchema,
  roomCount: z.number().int().positive(),
  availability: AvailabilitySchema,
  price: PriceSchema.exactOptional(),
  floorPlan: FloorPlanSchema.exactOptional(),
}) satisfies z.ZodType<Apartment>;

export const FloorSchema = z.object({
  id: z.string().min(1),
  level: z.number().int().nonnegative(),
  label: z.string().min(1),
}) satisfies z.ZodType<Floor>;

export const BuildingSchema = z.object({
  footprint: PolygonSchema,
  floorToFloorHeight: PositiveLengthSchema,
  groundFloorElevation: LengthSchema,
  floors: z.array(FloorSchema).min(1),
}) satisfies z.ZodType<Building>;

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase kebab-case slug");

/** Validates a whole project, including that every apartment sits on a known floor. */
export const ProjectSchema = z
  .object({
    slug,
    name: z.string().min(1),
    tagline: z.string().min(1),
    summary: z.string().min(1),
    isDemo: z.boolean(),
    building: BuildingSchema,
    apartments: z.array(ApartmentSchema),
  })
  .superRefine((project, ctx) => {
    const floorIds = new Set(project.building.floors.map((f) => f.id));
    const seen = new Set<string>();

    project.apartments.forEach((apartment, index) => {
      if (!floorIds.has(apartment.floorId)) {
        ctx.addIssue({
          code: "custom",
          message: `Apartment "${apartment.id}" is on unknown floor "${apartment.floorId}"`,
          path: ["apartments", index, "floorId"],
        });
      }
      if (seen.has(apartment.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate apartment id "${apartment.id}"`,
          path: ["apartments", index, "id"],
        });
      }
      seen.add(apartment.id);
    });
  }) satisfies z.ZodType<Project>;
