import { describe, expect, it } from "vitest";

import type { Apartment, Project } from "../types";
import { ApartmentSchema, PriceSchema, ProjectSchema } from "./building";

const apartment: Apartment = {
  id: "a-1",
  floorId: "f-0",
  number: "0.01",
  area: { value: 50, unit: "m2", provenance: "estimated" },
  roomCount: 2,
  availability: "available",
};

const project: Project = {
  slug: "test-court",
  name: "Test Court",
  tagline: "Tagline",
  summary: "Summary",
  setting: "Setting",
  typicalUnitsPerFloor: 4,
  isDemo: true,
  building: {
    footprint: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ],
    floorToFloorHeight: { value: 3, unit: "m", provenance: "estimated" },
    groundFloorElevation: { value: 1, unit: "m", provenance: "estimated" },
    floors: [{ id: "f-0", level: 0, label: "Ground" }],
  },
  apartments: [apartment],
};

const messages = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((i) => i.message) ?? [];

describe("ProjectSchema", () => {
  it("accepts a valid project", () => {
    expect(ProjectSchema.safeParse(project).success).toBe(true);
  });

  it("rejects apartments on unknown floors", () => {
    const result = ProjectSchema.safeParse({
      ...project,
      apartments: [{ ...apartment, floorId: "f-9" }],
    });
    expect(messages(result)).toContain('Apartment "a-1" is on unknown floor "f-9"');
  });

  it("rejects duplicate apartment ids", () => {
    const result = ProjectSchema.safeParse({ ...project, apartments: [apartment, apartment] });
    expect(messages(result)).toContain('Duplicate apartment id "a-1"');
  });

  it("requires a kebab-case slug", () => {
    expect(ProjectSchema.safeParse({ ...project, slug: "Test Court" }).success).toBe(false);
  });
});

describe("ApartmentSchema", () => {
  it("accepts an optional price and rejects an explicit undefined", () => {
    expect(
      ApartmentSchema.safeParse({ ...apartment, price: { amount: 1, currency: "EUR" } }).success,
    ).toBe(true);
    expect(ApartmentSchema.safeParse({ ...apartment, price: undefined }).success).toBe(false);
  });

  it("rejects unknown availability", () => {
    expect(ApartmentSchema.safeParse({ ...apartment, availability: "maybe" }).success).toBe(false);
  });
});

describe("PriceSchema", () => {
  it("requires an ISO 4217 currency code", () => {
    expect(PriceSchema.safeParse({ amount: 100, currency: "eur" }).success).toBe(false);
  });
});
