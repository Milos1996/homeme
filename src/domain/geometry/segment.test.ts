import { describe, expect, it } from "vitest";

import { segmentLength } from "./segment";

describe("segmentLength", () => {
  it("measures axis-aligned and diagonal segments", () => {
    expect(segmentLength({ x: 0, y: 0 }, { x: 6, y: 0 })).toBe(6);
    expect(segmentLength({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("is 0 for identical points", () => {
    expect(segmentLength({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });
});
