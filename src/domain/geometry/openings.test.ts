import { describe, expect, it } from "vitest";

import { layoutOpenings } from "./openings";
import { pointInPolygon, polygonCentroid } from "./polygon";
import { studioPlan } from "../../../tests/fixtures/floor-plans";

describe("layoutOpenings", () => {
  it("places openings along their wall from the wall's start", () => {
    const [door, win] = layoutOpenings(studioPlan);
    // Door is on the south wall, which runs west from (6,4): offset 1, width 0.9.
    expect(door!.start.x).toBeCloseTo(5);
    expect(door!.end.x).toBeCloseTo(4.1);
    expect(door!.start.y).toBeCloseTo(4);
    // Window on the north wall, which runs east from (0,0): offset 2, width 1.5.
    expect(win!.start).toEqual({ x: 2, y: 0 });
    expect(win!.end).toEqual({ x: 3.5, y: 0 });
    expect(win!.halfThickness).toBeCloseTo(0.15);
  });

  it("swings doors into the room", () => {
    const [door] = layoutOpenings(studioPlan);
    // South wall runs west, so its left normal points north (−y), into the room.
    expect(door!.normal.y).toBeCloseTo(-1);
    expect(door!.swing).toBe(1);

    const reversed = {
      ...studioPlan,
      walls: studioPlan.walls.map((w) =>
        w.id === "w-s" ? { ...w, start: w.end, end: w.start } : w,
      ),
    };
    // Same wall drawn the other way: left now points outside, so the door swings right.
    const flipped = layoutOpenings({
      ...reversed,
      openings: [
        { ...studioPlan.openings[0]!, offset: { ...studioPlan.openings[0]!.offset, value: 4.1 } },
      ],
    });
    expect(flipped[0]!.swing).toBe(-1);
  });

  it("skips openings on unknown walls", () => {
    expect(
      layoutOpenings({ ...studioPlan, openings: [{ ...studioPlan.openings[0]!, wallId: "nope" }] }),
    ).toEqual([]);
  });
});

describe("polygonCentroid / pointInPolygon", () => {
  const room = studioPlan.rooms[0]!.polygon;

  it("finds the centre of a rectangle and of an L shape", () => {
    expect(polygonCentroid(room)).toEqual({ x: 3, y: 2 });
    const l = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 4 },
      { x: 0, y: 4 },
    ];
    const c = polygonCentroid(l);
    expect(c.x).toBeCloseTo(5 / 3);
    expect(c.y).toBeCloseTo(5 / 3);
  });

  it("falls back to the vertex average for degenerate input", () => {
    expect(polygonCentroid([])).toEqual({ x: 0, y: 0 });
    expect(
      polygonCentroid([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
      ]),
    ).toEqual({ x: 1, y: 0 });
  });

  it("tests whether points are inside", () => {
    expect(pointInPolygon({ x: 3, y: 2 }, room)).toBe(true);
    expect(pointInPolygon({ x: 7, y: 2 }, room)).toBe(false);
  });
});

describe("door swing between two rooms", () => {
  it("opens into the private room rather than the hallway", async () => {
    const { typeA } = await import("@/data/projects/linden-court/floor-plans/type-a");
    const byId = new Map(layoutOpenings(typeA).map((o) => [o.id, o]));
    // w-hall-bed2 runs south at x=4.4; its left normal points west into the hallway.
    expect(byId.get("d-bedroom-2")!.swing).toBe(-1);
    // w-living-bed runs south at x=5.8; left is the living room, right the bedroom.
    expect(byId.get("d-bedroom-1")!.swing).toBe(-1);
    // Bathroom door: left (west) is the bathroom, so it keeps the default.
    expect(byId.get("d-bathroom")!.swing).toBe(1);
    // Entrance opens inwards into the hallway.
    expect(byId.get("d-entrance")!.swing).toBe(1);
  });
});
