import type { Point2 } from "../types";

/** Euclidean distance between two plan points, in metres. */
export function segmentLength(a: Point2, b: Point2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}
