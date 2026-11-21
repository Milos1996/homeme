import type { FloorPlan, Length, Point2, Wall } from "../../src/domain/types";

const m = (value: number, provenance: Length["provenance"] = "estimated"): Length => ({
  value,
  unit: "m",
  provenance,
});

const wall = (id: string, start: Point2, end: Point2, exterior = true): Wall => ({
  id,
  start,
  end,
  thickness: m(exterior ? 0.3 : 0.12),
  height: m(2.7),
  exterior,
});

/** A 6 × 4 m single room with a door and a window. Valid. */
export const studioPlan: FloorPlan = {
  rooms: [
    {
      id: "r-living",
      name: "Living room",
      type: "living",
      polygon: [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 6, y: 4 },
        { x: 0, y: 4 },
      ],
    },
  ],
  walls: [
    wall("w-n", { x: 0, y: 0 }, { x: 6, y: 0 }),
    wall("w-e", { x: 6, y: 0 }, { x: 6, y: 4 }),
    wall("w-s", { x: 6, y: 4 }, { x: 0, y: 4 }),
    wall("w-w", { x: 0, y: 4 }, { x: 0, y: 0 }),
  ],
  openings: [
    {
      id: "o-door",
      wallId: "w-s",
      kind: "door",
      offset: m(1),
      width: m(0.9),
      height: m(2.1),
      sillHeight: m(0),
    },
    {
      id: "o-window",
      wallId: "w-n",
      kind: "window",
      offset: m(2, "verified"),
      width: m(1.5, "verified"),
      height: m(1.4),
      sillHeight: m(0.9),
    },
  ],
};

/** Invalid: the window runs past the end of its 6 m wall. */
export const openingPastWallEnd: FloorPlan = {
  ...studioPlan,
  openings: [{ ...studioPlan.openings[1]!, offset: m(5), width: m(1.5) }],
};

/** Invalid: the opening references a wall that doesn't exist. */
export const openingOnUnknownWall: FloorPlan = {
  ...studioPlan,
  openings: [{ ...studioPlan.openings[0]!, wallId: "w-missing" }],
};

/** Invalid: the window is taller than the wall (sill 0.9 + 2.0 > 2.7). */
export const openingTallerThanWall: FloorPlan = {
  ...studioPlan,
  openings: [{ ...studioPlan.openings[1]!, height: m(2) }],
};
