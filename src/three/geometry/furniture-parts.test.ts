import { describe, expect, it } from "vitest";

import { FURNITURE_CATALOG } from "@/domain/geometry";
import type { FurnitureType } from "@/domain/types";

import { furnitureParts } from "./furniture-parts";

const TYPES = Object.keys(FURNITURE_CATALOG) as FurnitureType[];

describe("furnitureParts", () => {
  it.each(TYPES)("%s stays within its catalog size and sits on the floor", (type) => {
    const { width, depth, height } = FURNITURE_CATALOG[type];
    const parts = furnitureParts(type);
    expect(parts.length).toBeGreaterThan(0);

    for (const { size, position } of parts) {
      const [w, h, d] = size;
      const [x, y, z] = position;
      expect(Math.abs(x) + w / 2).toBeLessThanOrEqual(width / 2 + 1e-9);
      expect(Math.abs(z) + d / 2).toBeLessThanOrEqual(depth / 2 + 0.011);
      expect(y - h / 2).toBeGreaterThanOrEqual(-1e-9);
      expect(y + h / 2).toBeLessThanOrEqual(Math.max(height, 0.9) + 1e-9);
    }
  });
});
