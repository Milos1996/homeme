import { describe, expect, it } from "vitest";

import type { Length, Opening, Point2, Wall } from "../types";
import { polygonArea, polygonBounds } from "./polygon";
import { floorPlanPrisms, wallExtents, wallPrisms } from "./walls";

const m = (value: number): Length => ({ value, unit: "m", provenance: "estimated" });
const wall = (id: string, start: Point2, end: Point2, t = 0.3, h = 2.7): Wall => ({
  id,
  start,
  end,
  thickness: m(t),
  height: m(h),
  exterior: true,
});
const opening = (
  wallId: string,
  kind: Opening["kind"],
  offset: number,
  width: number,
  height: number,
  sill: number,
): Opening => ({
  id: `${wallId}-${offset}`,
  wallId,
  kind,
  offset: m(offset),
  width: m(width),
  height: m(height),
  sillHeight: m(sill),
});

// 6 × 4 m rectangle on wall centre lines, 0.3 m walls.
const ring = [
  wall("n", { x: 0, y: 0 }, { x: 6, y: 0 }),
  wall("e", { x: 6, y: 0 }, { x: 6, y: 4 }),
  wall("s", { x: 6, y: 4 }, { x: 0, y: 4 }),
  wall("w", { x: 0, y: 4 }, { x: 0, y: 0 }),
];

const totalArea = (polys: { footprint: readonly Point2[] }[]) =>
  polys.reduce((sum, p) => sum + polygonArea(p.footprint), 0);

describe("wallExtents", () => {
  it("mitres an L corner: inner face shortened, outer face extended by half the other wall", () => {
    const [n] = ring;
    // n runs east from (0,0); its left normal points to +y, towards wall "w" → left is the inner face.
    expect(wallExtents(n!, ring)).toEqual({
      leftStart: expect.closeTo(0.15, 6) as number,
      rightStart: expect.closeTo(-0.15, 6) as number,
      leftEnd: expect.closeTo(5.85, 6) as number,
      rightEnd: expect.closeTo(6.15, 6) as number,
    });
  });

  it("stops a T-joined wall at the face of the wall it meets", () => {
    const partition = wall("p", { x: 3, y: 0 }, { x: 3, y: 4 }, 0.12);
    const ext = wallExtents(partition, [...ring, partition]);
    expect(ext.leftStart).toBeCloseTo(0.15);
    expect(ext.rightStart).toBeCloseTo(0.15);
    expect(ext.leftEnd).toBeCloseTo(3.85);
    expect(ext.rightEnd).toBeCloseTo(3.85);
  });

  it("mitres non-perpendicular corners", () => {
    const a = wall("a", { x: 0, y: 0 }, { x: 4, y: 0 }, 0.2);
    const b = wall("b", { x: 0, y: 0 }, { x: 3, y: 3 }, 0.2);
    const ext = wallExtents(a, [a, b]);
    // 45° corner: the inner face is trimmed and the outer face extended by h / tan(22.5°) ≈ 0.2414.
    expect(ext.leftStart).toBeCloseTo(0.1 / Math.tan(Math.PI / 8), 6);
    expect(ext.rightStart).toBeCloseTo(-0.1 / Math.tan(Math.PI / 8), 6);
  });

  it("leaves free ends, collinear continuations and 3-way junctions square", () => {
    const free = wall("f", { x: 0, y: 0 }, { x: 2, y: 0 });
    expect(wallExtents(free, [free])).toEqual({
      leftStart: 0,
      rightStart: 0,
      leftEnd: 2,
      rightEnd: 2,
    });

    const next = wall("g", { x: 2, y: 0 }, { x: 5, y: 0 });
    expect(wallExtents(free, [free, next]).leftEnd).toBe(2);

    const up = wall("u", { x: 2, y: 0 }, { x: 2, y: -2 });
    expect(wallExtents(free, [free, next, up]).rightEnd).toBe(2);
  });
});

describe("wallPrisms", () => {
  it("produces a closed ring with no gaps or overlaps", () => {
    const prisms = floorPlanPrisms({ rooms: [], walls: ring, openings: [] });
    const outer = 6.3 * 4.3;
    const inner = 5.7 * 3.7;
    expect(prisms).toHaveLength(4);
    expect(totalArea(prisms)).toBeCloseTo(outer - inner, 9);
  });

  it("adds a T-joined partition exactly between the inner faces", () => {
    const partition = wall("p", { x: 3, y: 0 }, { x: 3, y: 4 }, 0.12);
    const walls = [...ring, partition];
    const prisms = floorPlanPrisms({ rooms: [], walls, openings: [] });
    const ringArea = 6.3 * 4.3 - 5.7 * 3.7;
    expect(totalArea(prisms)).toBeCloseTo(ringArea + 3.7 * 0.12, 9);
  });

  it("cuts a window into side pieces, a lintel and a sill at the right heights", () => {
    const [n] = ring;
    const win = opening("n", "window", 2, 1.5, 1.4, 0.9);
    const prisms = wallPrisms(n!, [win], ring);

    const pieces = prisms.filter((p) => p.kind === "wall");
    const lintel = prisms.find((p) => p.kind === "lintel")!;
    const sill = prisms.find((p) => p.kind === "sill")!;

    expect(pieces).toHaveLength(2);
    expect(lintel).toMatchObject({ bottom: 2.3, top: 2.7 });
    expect(sill).toMatchObject({ bottom: 0, top: 0.9 });

    const b = polygonBounds(lintel.footprint)!;
    expect(b.minX).toBeCloseTo(2);
    expect(b.maxX).toBeCloseTo(3.5);
    expect(b.height).toBeCloseTo(0.3);

    // The two side pieces stop exactly at the opening's edges.
    const [west, east] = pieces.map((p) => polygonBounds(p.footprint)!);
    expect(west!.maxX).toBeCloseTo(2);
    expect(east!.minX).toBeCloseTo(3.5);
  });

  it("gives doors a lintel but no sill, and full-height openings neither", () => {
    const [n] = ring;
    const door = opening("n", "door", 1, 0.9, 2.1, 0);
    const doorPrisms = wallPrisms(n!, [door], ring);
    expect(doorPrisms.filter((p) => p.kind === "sill")).toHaveLength(0);
    expect(doorPrisms.find((p) => p.kind === "lintel")).toMatchObject({ bottom: 2.1, top: 2.7 });

    const fullHeight = opening("n", "door", 1, 0.9, 2.7, 0);
    expect(wallPrisms(n!, [fullHeight], ring).map((p) => p.kind)).toEqual(["wall", "wall"]);
  });

  it("handles several openings and an opening flush with a wall end", () => {
    const free = wall("f", { x: 0, y: 0 }, { x: 6, y: 0 });
    const openings = [
      opening("f", "window", 4, 1, 1, 1),
      opening("f", "door", 0, 0.9, 2.1, 0),
      opening("f", "window", 2, 1, 1, 1),
    ];
    const pieces = wallPrisms(free, openings, [free]).filter((p) => p.kind === "wall");
    // [0–0.9] is the door, so the wall pieces are 0.9–2, 3–4 and 5–6.
    expect(pieces.map((p) => polygonBounds(p.footprint)!.width)).toEqual([
      expect.closeTo(1.1, 9),
      expect.closeTo(1, 9),
      expect.closeTo(1, 9),
    ]);
  });

  it("ignores openings that belong to other walls", () => {
    const [n] = ring;
    expect(wallPrisms(n!, [opening("e", "window", 1, 1, 1, 1)], ring)).toHaveLength(1);
  });
});
