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

/** Area-weighted centroid of a simple polygon. Falls back to the vertex average when degenerate. */
export function polygonCentroid(polygon: Polygon): { x: number; y: number } {
  const n = polygon.length;
  const twiceArea = 2 * signedPolygonArea(polygon);
  if (n === 0) return { x: 0, y: 0 };
  if (Math.abs(twiceArea) < 1e-12) {
    const sum = polygon.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / n, y: sum.y / n };
  }
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < n; i++) {
    const a = polygon[i]!;
    const b = polygon[(i + 1) % n]!;
    const f = a.x * b.y - b.x * a.y;
    cx += (a.x + b.x) * f;
    cy += (a.y + b.y) * f;
  }
  return { x: cx / (3 * twiceArea), y: cy / (3 * twiceArea) };
}

/** Even-odd point-in-polygon test. Points exactly on an edge may go either way. */
export function pointInPolygon(point: { x: number; y: number }, polygon: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!;
    const b = polygon[j]!;
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}
