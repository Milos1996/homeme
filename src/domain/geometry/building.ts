import type { Point2, Polygon } from "../types";
import { signedPolygonArea } from "./polygon";
import { add, intersectLines, length, normalize, scale, sub } from "./vector";

/**
 * Offsets a simple polygon by `distance` metres: positive grows it outwards,
 * negative shrinks it. Corners are mitred (adjacent offset edges intersect).
 */
export function offsetPolygon(polygon: Polygon, distance: number): Polygon {
  const n = polygon.length;
  if (n < 3 || distance === 0) return polygon;

  // Outward normal is to the right of each edge for positive (CCW in y-up) winding.
  const sign = signedPolygonArea(polygon) > 0 ? 1 : -1;
  const edges = polygon.map((a, i) => {
    const b = polygon[(i + 1) % n]!;
    const dir = normalize(sub(b, a));
    const outward = { x: dir.y * sign, y: -dir.x * sign };
    return { origin: add(a, scale(outward, distance)), dir };
  });

  return polygon.map((corner, i) => {
    const prev = edges[(i - 1 + n) % n]!;
    const next = edges[i]!;
    const s = intersectLines(prev.origin, prev.dir, next.origin, next.dir);
    // Collinear edges: just push the corner along the shared normal.
    return s === null
      ? add(corner, sub(next.origin, polygon[i]!))
      : add(prev.origin, scale(prev.dir, s));
  });
}

export interface PerimeterPoint {
  readonly point: Point2;
  /** Direction of the edge the point lies on, in radians (plan space). */
  readonly angle: number;
}

/**
 * Evenly spaced points along each edge (excluding corners), roughly
 * `spacing` metres apart. Used to place facade mullions between windows.
 */
export function perimeterPoints(polygon: Polygon, spacing: number): PerimeterPoint[] {
  return polygon.flatMap((a, i) => {
    const b = polygon[(i + 1) % polygon.length]!;
    const edge = sub(b, a);
    const count = Math.max(1, Math.round(length(edge) / spacing));
    const angle = Math.atan2(edge.y, edge.x);
    return Array.from({ length: count - 1 }, (_, k) => ({
      point: add(a, scale(edge, (k + 1) / count)),
      angle,
    }));
  });
}
