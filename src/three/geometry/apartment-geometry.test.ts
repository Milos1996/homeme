import { Box3 } from "three";
import { describe, expect, it } from "vitest";

import { typeA } from "@/data/projects/linden-court/floor-plans/type-a";
import { floorPlanPrisms } from "@/domain/geometry";

import {
  buildFloorSlab,
  buildWallGeometry,
  extrudeFootprint,
  FLOOR_SLAB_THICKNESS,
} from "./apartment-geometry";

const square = [
  { x: 1, y: 2 },
  { x: 3, y: 2 },
  { x: 3, y: 5 },
  { x: 1, y: 5 },
];

describe("apartment geometry", () => {
  it("maps plan (x, y) to world (x, z) and extrudes upward from bottom to top", () => {
    const box = new Box3().setFromBufferAttribute(
      extrudeFootprint(square, 0.9, 2.3).getAttribute("position") as never,
    );
    expect(box.min.toArray().map((v) => +v.toFixed(6))).toEqual([1, 0.9, 2]);
    expect(box.max.toArray().map((v) => +v.toFixed(6))).toEqual([3, 2.3, 5]);
  });

  it("builds Type A walls as one merged geometry within the plan envelope", () => {
    const geometry = buildWallGeometry(floorPlanPrisms(typeA))!;
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox!;
    // West/north walls are 0.25 m (half 0.125); east/south facade walls 0.30 m (half 0.15).
    expect(min.x).toBeCloseTo(-0.125);
    expect(min.z).toBeCloseTo(-0.125);
    expect(max.x).toBeCloseTo(9.15);
    expect(max.z).toBeCloseTo(7.15);
    expect(min.y).toBeCloseTo(0);
    expect(max.y).toBeCloseTo(2.7);
  });

  it("returns null when there are no walls", () => {
    expect(buildWallGeometry([])).toBeNull();
  });

  it("puts the floor slab's top face at floor level", () => {
    const slab = buildFloorSlab(square);
    slab.computeBoundingBox();
    expect(slab.boundingBox!.max.y).toBeCloseTo(0);
    expect(slab.boundingBox!.min.y).toBeCloseTo(-FLOOR_SLAB_THICKNESS);
  });
});
