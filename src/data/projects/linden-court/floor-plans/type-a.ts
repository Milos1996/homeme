import type { FloorPlan, Length, Point2, Wall } from "@/domain/types";

/**
 * Type A: two-bedroom corner apartment, ~63 m².
 *
 * Plan coordinates are wall centre lines in metres; x grows east, y grows
 * south. The corridor (with the entrance) is on the north side, the facade
 * faces south and east, and the west wall is shared with the neighbour.
 *
 *   y=0   ┌──────┬────┬────────────┐  ← corridor wall (entrance in hallway)
 *         │ Bath │Hall│ Bedroom 2  │
 *   y=3.4 ├──────┴─┬──┴──┬─────────┤
 *         │Kitchen │Living│ Bedroom │
 *   y=7   └────────┴─────┴─────────┘  ← south facade
 *         x=0     2.6   5.8        9
 *
 * Every value is ESTIMATED: the reference building's dimensioned unit plans
 * have not arrived yet (HOM-23 will replace this with verified values).
 */

const SOURCE = "Estimated layout for demo purposes";

const m = (value: number): Length => ({
  value,
  unit: "m",
  provenance: "estimated",
  source: SOURCE,
});

const WALL_HEIGHT = m(2.7);
const T_FACADE = m(0.3);
const T_PARTY = m(0.25);
const T_INTERIOR = m(0.12);

const wall = (
  id: string,
  start: Point2,
  end: Point2,
  thickness: Length,
  exterior: boolean,
): Wall => ({ id, start, end, thickness, height: WALL_HEIGHT, exterior });

const rect = (x0: number, y0: number, x1: number, y1: number): Point2[] => [
  { x: x0, y: y0 },
  { x: x1, y: y0 },
  { x: x1, y: y1 },
  { x: x0, y: y1 },
];

export const typeA: FloorPlan = {
  rooms: [
    { id: "bathroom", name: "Bathroom", type: "bathroom", polygon: rect(0, 0, 2.4, 3.4) },
    { id: "hallway", name: "Hallway", type: "hallway", polygon: rect(2.4, 0, 4.4, 3.4) },
    { id: "bedroom-2", name: "Bedroom 2", type: "bedroom", polygon: rect(4.4, 0, 9, 3.4) },
    { id: "kitchen", name: "Kitchen", type: "kitchen", polygon: rect(0, 3.4, 2.6, 7) },
    { id: "living", name: "Living room", type: "living", polygon: rect(2.6, 3.4, 5.8, 7) },
    { id: "bedroom-1", name: "Bedroom", type: "bedroom", polygon: rect(5.8, 3.4, 9, 7) },
  ],
  walls: [
    // Envelope
    wall("w-north", { x: 0, y: 0 }, { x: 9, y: 0 }, T_PARTY, false), // corridor wall
    wall("w-east", { x: 9, y: 0 }, { x: 9, y: 7 }, T_FACADE, true),
    wall("w-south", { x: 9, y: 7 }, { x: 0, y: 7 }, T_FACADE, true),
    wall("w-west", { x: 0, y: 7 }, { x: 0, y: 0 }, T_PARTY, false), // neighbour
    // Interior partitions (kitchen and living room are open plan: no wall between them)
    wall("w-mid", { x: 0, y: 3.4 }, { x: 9, y: 3.4 }, T_INTERIOR, false),
    wall("w-bath-hall", { x: 2.4, y: 0 }, { x: 2.4, y: 3.4 }, T_INTERIOR, false),
    wall("w-hall-bed2", { x: 4.4, y: 0 }, { x: 4.4, y: 3.4 }, T_INTERIOR, false),
    wall("w-living-bed", { x: 5.8, y: 3.4 }, { x: 5.8, y: 7 }, T_INTERIOR, false),
  ],
  openings: [
    // Doors
    door("d-entrance", "w-north", 3.0, 1.0),
    door("d-hall-living", "w-mid", 2.8, 0.9),
    door("d-bathroom", "w-bath-hall", 1.8, 0.8),
    door("d-bedroom-2", "w-hall-bed2", 2.2, 0.8),
    door("d-bedroom-1", "w-living-bed", 0.4, 0.8),
    // Windows (offsets run from each wall's start point)
    window("win-bedroom-1-south", "w-south", 0.7, 1.6, 1.5, 0.9),
    window("win-living", "w-south", 3.8, 2.0, 2.2, 0.3),
    window("win-kitchen", "w-south", 7.2, 1.2, 1.2, 1.05),
    window("win-bedroom-2", "w-east", 0.9, 1.4, 1.5, 0.9),
    window("win-bedroom-1-east", "w-east", 4.6, 1.4, 1.5, 0.9),
  ],
  // Illustrative furniture, placed clear of door swings.
  furniture: [
    {
      id: "f-bathtub",
      type: "bathtub",
      roomId: "bathroom",
      position: { x: 0.52, y: 1.0 },
      rotation: 0,
    },
    { id: "f-wc", type: "wc", roomId: "bathroom", position: { x: 1.5, y: 0.45 }, rotation: 0 },
    {
      id: "f-basin",
      type: "washbasin",
      roomId: "bathroom",
      position: { x: 0.37, y: 2.75 },
      rotation: 90,
    },
    {
      id: "f-bed-2",
      type: "bed-single",
      roomId: "bedroom-2",
      position: { x: 8.35, y: 1.15 },
      rotation: 0,
    },
    { id: "f-desk", type: "desk", roomId: "bedroom-2", position: { x: 5.5, y: 0.45 }, rotation: 0 },
    {
      id: "f-counter",
      type: "kitchen-counter",
      roomId: "kitchen",
      position: { x: 0.43, y: 5.3 },
      rotation: 90,
    },
    {
      id: "f-dining",
      type: "dining-table",
      roomId: "kitchen",
      position: { x: 1.75, y: 5.6 },
      rotation: 0,
    },
    { id: "f-sofa", type: "sofa", roomId: "living", position: { x: 5.27, y: 5.65 }, rotation: 90 },
    {
      id: "f-coffee",
      type: "coffee-table",
      roomId: "living",
      position: { x: 4.2, y: 5.65 },
      rotation: 90,
    },
    {
      id: "f-bed-1",
      type: "bed-double",
      roomId: "bedroom-1",
      position: { x: 7.95, y: 5.6 },
      rotation: 90,
    },
    {
      id: "f-wardrobe",
      type: "wardrobe",
      roomId: "bedroom-1",
      position: { x: 7.7, y: 3.8 },
      rotation: 0,
    },
  ],
};

function door(id: string, wallId: string, offset: number, width: number) {
  return {
    id,
    wallId,
    kind: "door" as const,
    offset: m(offset),
    width: m(width),
    height: m(2.1),
    sillHeight: m(0),
  };
}

function window(
  id: string,
  wallId: string,
  offset: number,
  width: number,
  height: number,
  sill: number,
) {
  return {
    id,
    wallId,
    kind: "window" as const,
    offset: m(offset),
    width: m(width),
    height: m(height),
    sillHeight: m(sill),
  };
}
