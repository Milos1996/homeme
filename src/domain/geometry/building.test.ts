import { describe, expect, it } from "vitest";

import { offsetPolygon, perimeterPoints } from "./building";
import { polygonBounds } from "./polygon";

const rect = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 4 },
  { x: 0, y: 4 },
];

describe("offsetPolygon", () => {
  it("grows and shrinks a rectangle regardless of winding", () => {
    for (const poly of [rect, [...rect].reverse()]) {
      const grown = polygonBounds(offsetPolygon(poly, 0.5))!;
      expect(grown.minX).toBeCloseTo(-0.5);
      expect(grown.maxY).toBeCloseTo(4.5);
      const shrunk = polygonBounds(offsetPolygon(poly, -1))!;
      expect(shrunk.width).toBeCloseTo(8);
      expect(shrunk.height).toBeCloseTo(2);
    }
  });

  it("returns the input for zero distance or degenerate polygons", () => {
    expect(offsetPolygon(rect, 0)).toBe(rect);
    expect(offsetPolygon(rect.slice(0, 2), 1)).toEqual(rect.slice(0, 2));
  });

  it("handles collinear vertices", () => {
    const withMidpoint = [rect[0]!, { x: 5, y: 0 }, ...rect.slice(1)];
    const b = polygonBounds(offsetPolygon(withMidpoint, 0.5))!;
    expect(b.minY).toBeCloseTo(-0.5);
    expect(b.width).toBeCloseTo(11);
  });
});

describe("perimeterPoints", () => {
  it("spaces points along each edge, excluding corners", () => {
    const points = perimeterPoints(rect, 2);
    // 10 m edges → 5 segments → 4 points each; 4 m edges → 2 segments → 1 point each.
    expect(points).toHaveLength(4 + 1 + 4 + 1);
    expect(points[0]!.point).toEqual({ x: 2, y: 0 });
    expect(points[0]!.angle).toBeCloseTo(0);
    expect(points[4]!.angle).toBeCloseTo(Math.PI / 2);
  });

  it("returns nothing for edges shorter than the spacing", () => {
    expect(perimeterPoints(rect, 20)).toEqual([]);
  });
});
