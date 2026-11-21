import type { Point2 } from "../types";

export const EPSILON = 1e-6;

export const add = (a: Point2, b: Point2): Point2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Point2, b: Point2): Point2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Point2, k: number): Point2 => ({ x: a.x * k, y: a.y * k });
export const dot = (a: Point2, b: Point2): number => a.x * b.x + a.y * b.y;
export const cross = (a: Point2, b: Point2): number => a.x * b.y - a.y * b.x;
export const length = (a: Point2): number => Math.hypot(a.x, a.y);
export const samePoint = (a: Point2, b: Point2, eps = EPSILON): boolean =>
  Math.abs(a.x - b.x) <= eps && Math.abs(a.y - b.y) <= eps;

/** Unit vector in the direction of `a`. Returns (0, 0) for a zero vector. */
export function normalize(a: Point2): Point2 {
  const len = length(a);
  return len === 0 ? { x: 0, y: 0 } : scale(a, 1 / len);
}

/** Left-hand perpendicular (rotate +90°). */
export const perp = (a: Point2): Point2 => ({ x: -a.y, y: a.x });

/**
 * Intersects the line `p + s·d` with the line `q + t·e` and returns `s`,
 * or `null` when the lines are parallel.
 */
export function intersectLines(p: Point2, d: Point2, q: Point2, e: Point2): number | null {
  const denom = cross(d, e);
  if (Math.abs(denom) < EPSILON) return null;
  return cross(sub(q, p), e) / denom;
}
