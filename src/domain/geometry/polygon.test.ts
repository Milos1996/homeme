import { describe, expect, it } from "vitest";

import { polygonArea, polygonBounds, signedPolygonArea } from "./polygon";

const rect = [
  { x: 0, y: 0 },
  { x: 6, y: 0 },
  { x: 6, y: 4 },
  { x: 0, y: 4 },
];

describe("polygonArea", () => {
  it("computes the area of a rectangle", () => {
    expect(polygonArea(rect)).toBe(24);
  });

  it("is independent of winding order", () => {
    expect(polygonArea([...rect].reverse())).toBe(24);
    expect(signedPolygonArea(rect)).toBe(-signedPolygonArea([...rect].reverse()));
  });

  it("handles concave (L-shaped) rooms", () => {
    const lShape = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 4 },
      { x: 0, y: 4 },
    ];
    expect(polygonArea(lShape)).toBe(12);
  });

  it("returns 0 for degenerate input", () => {
    expect(polygonArea([])).toBe(0);
    expect(polygonArea(rect.slice(0, 2))).toBe(0);
  });
});

describe("polygonBounds", () => {
  it("returns the bounding box across several polygons", () => {
    const other = [
      { x: -1, y: 2 },
      { x: 1, y: 5 },
      { x: 0, y: 3 },
    ];
    expect(polygonBounds(rect, other)).toEqual({
      minX: -1,
      minY: 0,
      maxX: 6,
      maxY: 5,
      width: 7,
      height: 5,
    });
  });

  it("returns null when there are no points", () => {
    expect(polygonBounds()).toBeNull();
    expect(polygonBounds([])).toBeNull();
  });
});
