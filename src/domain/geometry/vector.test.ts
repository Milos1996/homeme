import { describe, expect, it } from "vitest";

import { intersectLines, normalize, perp, samePoint } from "./vector";

describe("vector helpers", () => {
  it("normalizes vectors and handles zero length", () => {
    const n = normalize({ x: 3, y: 4 });
    expect(n.x).toBeCloseTo(0.6, 12);
    expect(n.y).toBeCloseTo(0.8, 12);
    expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it("rotates +90° for the left perpendicular", () => {
    expect(perp({ x: 1, y: 0 })).toEqual({ x: -0, y: 1 });
  });

  it("intersects lines and reports parallels as null", () => {
    expect(intersectLines({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: -1 }, { x: 0, y: 1 })).toBe(2);
    expect(
      intersectLines({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 0 }),
    ).toBeNull();
  });

  it("compares points with a tolerance", () => {
    expect(samePoint({ x: 1, y: 1 }, { x: 1 + 1e-9, y: 1 })).toBe(true);
    expect(samePoint({ x: 1, y: 1 }, { x: 1.01, y: 1 })).toBe(false);
  });
});
