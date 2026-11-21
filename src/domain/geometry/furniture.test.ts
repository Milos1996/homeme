import { describe, expect, it } from "vitest";

import { FURNITURE_CATALOG, furnitureFootprint } from "./furniture";
import { polygonArea, polygonBounds } from "./polygon";

describe("furnitureFootprint", () => {
  it("is an unrotated rectangle centred on the position", () => {
    const b = polygonBounds(
      furnitureFootprint({
        id: "s",
        type: "sofa",
        roomId: "r",
        position: { x: 2, y: 3 },
        rotation: 0,
      }),
    )!;
    expect(b.width).toBeCloseTo(2.2);
    expect(b.height).toBeCloseTo(0.9);
    expect(b.minX).toBeCloseTo(0.9);
    expect(b.minY).toBeCloseTo(2.55);
  });

  it("swaps width and depth at 90° and keeps the area at any angle", () => {
    const item = { id: "b", type: "bed-double" as const, roomId: "r", position: { x: 0, y: 0 } };
    const b = polygonBounds(furnitureFootprint({ ...item, rotation: 90 }))!;
    expect(b.width).toBeCloseTo(2.0);
    expect(b.height).toBeCloseTo(1.6);

    const { width, depth } = FURNITURE_CATALOG["bed-double"];
    expect(polygonArea(furnitureFootprint({ ...item, rotation: 33 }))).toBeCloseTo(width * depth);
  });
});
