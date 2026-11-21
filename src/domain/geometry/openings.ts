import type { FloorPlan, Opening, Point2, RoomType } from "../types";
import { pointInPolygon } from "./polygon";
import { add, length, normalize, perp, scale, sub } from "./vector";

const PRIVATE: ReadonlySet<RoomType> = new Set(["bedroom", "bathroom", "wc", "storage"]);

/** Plan-space placement of an opening, ready for drawing. */
export interface OpeningLayout {
  readonly id: string;
  readonly kind: Opening["kind"];
  /** Centre-line points where the opening starts and ends. */
  readonly start: Point2;
  readonly end: Point2;
  /** Unit vector along the wall and its left-hand normal. */
  readonly dir: Point2;
  readonly normal: Point2;
  readonly halfThickness: number;
  /** Door swing side: +1 opens towards the wall's left (normal), −1 to the right. */
  readonly swing: 1 | -1;
}

/**
 * Places every opening on its wall. Doors swing into a room rather than
 * outwards (so entrance doors open inwards); between two rooms they swing
 * into the private one (bedroom, bathroom, WC, storage). Otherwise left.
 */
export function layoutOpenings(plan: FloorPlan): OpeningLayout[] {
  const walls = new Map(plan.walls.map((w) => [w.id, w]));

  return plan.openings.flatMap((opening) => {
    const wall = walls.get(opening.wallId);
    if (!wall) return [];

    const axis = sub(wall.end, wall.start);
    const dir = normalize(axis);
    const normal = perp(dir);
    const from = opening.offset.value;
    const to = Math.min(from + opening.width.value, length(axis));
    const start = add(wall.start, scale(dir, from));
    const end = add(wall.start, scale(dir, to));

    const mid = add(start, scale(dir, (to - from) / 2));
    const probe = (side: 1 | -1) =>
      add(mid, scale(normal, side * (wall.thickness.value / 2 + 0.3)));
    const roomAt = (p: Point2) => plan.rooms.find((r) => pointInPolygon(p, r.polygon));
    const left = roomAt(probe(1));
    const right = roomAt(probe(-1));
    // Doors open into rooms (not outwards), and into private rooms rather than circulation.
    const swing: 1 | -1 =
      left && right
        ? PRIVATE.has(right.type) && !PRIVATE.has(left.type)
          ? -1
          : 1
        : left || !right
          ? 1
          : -1;

    return [
      {
        id: opening.id,
        kind: opening.kind,
        start,
        end,
        dir,
        normal,
        halfThickness: wall.thickness.value / 2,
        swing,
      },
    ];
  });
}
