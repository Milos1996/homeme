import type { Polygon } from "../types";

export interface Bounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Signed area of a simple polygon using the shoelace formula.
 * Positive for counter-clockwise rings in a y-up system
 * (clockwise when drawn in SVG's y-down space).
 */
export function signedPolygonArea(polygon: Polygon): number {
  const n = polygon.length;
  if (n < 3) return 0;

  let twiceArea = 0;
  for (let i = 0; i < n; i++) {
    const a = polygon[i]!;
    const b = polygon[(i + 1) % n]!;
    twiceArea += a.x * b.y - b.x * a.y;
  }
  return twiceArea / 2;
}

/** Absolute area of a simple polygon in square metres. Returns 0 for fewer than 3 points. */
export function polygonArea(polygon: Polygon): number {
  return Math.abs(signedPolygonArea(polygon));
}

/** Axis-aligned bounding box of one or more polygons. Returns `null` when there are no points. */
export function polygonBounds(...polygons: readonly Polygon[]): Bounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const polygon of polygons) {
    for (const p of polygon) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }

  if (minX === Infinity) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}
