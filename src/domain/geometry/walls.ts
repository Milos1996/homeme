import type { FloorPlan, Opening, Point2, Polygon, Wall } from "../types";
import {
  add,
  dot,
  EPSILON,
  intersectLines,
  length,
  normalize,
  perp,
  samePoint,
  scale,
  sub,
} from "./vector";

/**
 * A vertical solid: a plan footprint extruded from `bottom` to `top` (metres).
 * Walls become one or more prisms; openings split them into side pieces,
 * a lintel above and (for windows) a sill piece below.
 */
export interface Prism {
  readonly wallId: string;
  readonly kind: "wall" | "lintel" | "sill";
  readonly footprint: Polygon;
  readonly bottom: number;
  readonly top: number;
}

/** Where a wall's left (+normal) and right (−normal) faces start and end along its axis. */
export interface WallExtents {
  readonly leftStart: number;
  readonly leftEnd: number;
  readonly rightStart: number;
  readonly rightEnd: number;
}

interface Frame {
  readonly origin: Point2;
  readonly dir: Point2;
  readonly normal: Point2;
  readonly length: number;
  readonly half: number;
}

const frameOf = (wall: Wall): Frame => {
  const axis = sub(wall.end, wall.start);
  const dir = normalize(axis);
  return {
    origin: wall.start,
    dir,
    normal: perp(dir),
    length: length(axis),
    half: wall.thickness.value / 2,
  };
};

/** Point at distance `u` along the wall axis and `v` across it (positive = left). */
const at = (f: Frame, u: number, v: number): Point2 =>
  add(add(f.origin, scale(f.dir, u)), scale(f.normal, v));

/** Parameters `u` where one face of `wall` crosses both faces of `other`. */
function faceCrossings(f: Frame, side: 1 | -1, other: Wall): number[] {
  const o = frameOf(other);
  const p = at(f, 0, side * f.half);
  const hits: number[] = [];
  for (const s of [1, -1] as const) {
    const q = add(other.start, scale(o.normal, s * o.half));
    const u = intersectLines(p, f.dir, q, o.dir);
    if (u !== null) hits.push(u);
  }
  return hits;
}

/** True when `point` lies strictly inside `wall`'s centre line (not at its ends). */
function liesWithin(point: Point2, wall: Wall): boolean {
  const f = frameOf(wall);
  const rel = sub(point, wall.start);
  const u = dot(rel, f.dir);
  const v = dot(rel, f.normal);
  return Math.abs(v) <= EPSILON && u > EPSILON && u < f.length - EPSILON;
}

/**
 * Computes how far each face of `wall` extends at both ends so that joins are clean:
 * - L join (exactly one other wall shares the endpoint): faces are mitred.
 * - T join (the endpoint lies on another wall's centre line): the wall stops at that wall's face.
 * - Otherwise (free end, collinear continuation, or 3+ walls meeting): square end at the endpoint.
 */
export function wallExtents(wall: Wall, walls: readonly Wall[]): WallExtents {
  const f = frameOf(wall);
  const others = walls.filter((w) => w.id !== wall.id);

  const resolve = (end: "start" | "end") => {
    const point = end === "start" ? wall.start : wall.end;
    const base = end === "start" ? 0 : f.length;
    // Pick the crossing nearest the wall's interior or farthest from it.
    const inward = (hits: number[]) => (end === "start" ? Math.max(...hits) : Math.min(...hits));
    const outward = (hits: number[]) => (end === "start" ? Math.min(...hits) : Math.max(...hits));

    const sharing = others.filter((w) => samePoint(w.start, point) || samePoint(w.end, point));
    if (sharing.length === 1) {
      const other = sharing[0]!;
      const away = normalize(
        samePoint(other.start, point) ? sub(other.end, other.start) : sub(other.start, other.end),
      );
      const side = (s: 1 | -1) => {
        const hits = faceCrossings(f, s, other);
        if (hits.length < 2) return base; // collinear: nothing to trim
        const inner = dot(away, scale(f.normal, s)) > 0;
        return inner ? inward(hits) : outward(hits);
      };
      return { left: side(1), right: side(-1) };
    }

    if (sharing.length === 0) {
      const through = others.find((w) => liesWithin(point, w));
      if (through) {
        const side = (s: 1 | -1) => {
          const hits = faceCrossings(f, s, through);
          return hits.length < 2 ? base : inward(hits);
        };
        return { left: side(1), right: side(-1) };
      }
    }

    return { left: base, right: base };
  };

  const start = resolve("start");
  const end = resolve("end");
  return {
    leftStart: start.left,
    rightStart: start.right,
    leftEnd: end.left,
    rightEnd: end.right,
  };
}

const quad = (f: Frame, ls: number, le: number, rs: number, re: number): Polygon => [
  at(f, ls, f.half),
  at(f, le, f.half),
  at(f, re, -f.half),
  at(f, rs, -f.half),
];

/**
 * Splits one wall into prisms: full-height pieces between openings (with
 * the joined ends on the first and last piece), a lintel over every
 * opening, and a sill piece under windows.
 */
export function wallPrisms(
  wall: Wall,
  openings: readonly Opening[],
  walls: readonly Wall[],
): Prism[] {
  const f = frameOf(wall);
  const ext = wallExtents(wall, walls);
  const height = wall.height.value;
  const own = openings
    .filter((o) => o.wallId === wall.id)
    .map((o) => ({
      from: o.offset.value,
      to: o.offset.value + o.width.value,
      sill: o.sillHeight.value,
      head: o.sillHeight.value + o.height.value,
    }))
    .sort((a, b) => a.from - b.from);

  const prisms: Prism[] = [];
  const cuts = [...own.flatMap((o) => [o.from, o.to])];
  const bounds = [null, ...cuts, null]; // null = use the joined end

  for (let i = 0; i < bounds.length; i += 2) {
    const from = bounds[i];
    const to = bounds[i + 1];
    const ls = from ?? ext.leftStart;
    const rs = from ?? ext.rightStart;
    const le = to ?? ext.leftEnd;
    const re = to ?? ext.rightEnd;
    if (Math.max(le, re) - Math.min(ls, rs) <= EPSILON) continue;
    prisms.push({
      wallId: wall.id,
      kind: "wall",
      footprint: quad(f, ls, le, rs, re),
      bottom: 0,
      top: height,
    });
  }

  for (const o of own) {
    const footprint = quad(f, o.from, o.to, o.from, o.to);
    if (o.head < height - EPSILON) {
      prisms.push({ wallId: wall.id, kind: "lintel", footprint, bottom: o.head, top: height });
    }
    if (o.sill > EPSILON) {
      prisms.push({ wallId: wall.id, kind: "sill", footprint, bottom: 0, top: o.sill });
    }
  }

  return prisms;
}

/** All wall prisms for a floor plan. */
export function floorPlanPrisms(plan: FloorPlan): Prism[] {
  return plan.walls.flatMap((wall) => wallPrisms(wall, plan.openings, plan.walls));
}
