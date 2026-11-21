import { describe, expect, it } from "vitest";

import { polygonArea } from "@/domain/geometry";
import { FloorPlanSchema } from "@/domain/schemas";
import { countProvenance, floorPlanDimensions } from "@/domain/selectors/provenance";

import { typeA } from "./type-a";

describe("Linden Court Type A floor plan", () => {
  it("passes the floor plan schema", () => {
    const result = FloorPlanSchema.safeParse(typeA);
    expect(result.error?.issues ?? []).toEqual([]);
  });

  it("has the required room types", () => {
    const types = new Set(typeA.rooms.map((r) => r.type));
    for (const t of ["living", "kitchen", "bedroom", "bathroom", "hallway"] as const) {
      expect(types).toContain(t);
    }
  });

  it("has exterior and interior walls with realistic thicknesses", () => {
    const exterior = typeA.walls.filter((w) => w.exterior);
    const interior = typeA.walls.filter((w) => !w.exterior);
    expect(exterior.length).toBeGreaterThan(0);
    expect(interior.length).toBeGreaterThan(0);
    for (const w of exterior) expect(w.thickness.value).toBeGreaterThanOrEqual(0.25);
    for (const w of typeA.walls) expect(w.thickness.value).toBeGreaterThanOrEqual(0.1);
  });

  it("has an entrance door, interior doors and several windows", () => {
    const doors = typeA.openings.filter((o) => o.kind === "door");
    const windows = typeA.openings.filter((o) => o.kind === "window");
    expect(doors.some((d) => d.wallId === "w-north")).toBe(true);
    expect(doors.length).toBeGreaterThanOrEqual(3);
    expect(windows.length).toBeGreaterThanOrEqual(3);
  });

  it("marks every dimension as estimated (no plans received yet)", () => {
    expect(countProvenance(floorPlanDimensions(typeA)).verified).toBe(0);
  });

  it("adds up to about 63 m²", () => {
    const total = typeA.rooms.reduce((sum, r) => sum + polygonArea(r.polygon), 0);
    expect(total).toBeCloseTo(63, 1);
  });
});

describe("Type A furniture", () => {
  it("places bed, sofa, table and kitchen units inside their rooms", () => {
    const types = new Set(typeA.furniture?.map((f) => f.type));
    for (const t of ["bed-double", "sofa", "dining-table", "kitchen-counter"] as const) {
      expect(types).toContain(t);
    }
    // FloorPlanSchema checks every piece references a room and fits inside it.
    expect(FloorPlanSchema.safeParse(typeA).success).toBe(true);
  });
});
