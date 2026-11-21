import { describe, expect, it } from "vitest";

import { FloorPlanSchema, RoomSchema, WallSchema } from "./floor-plan";
import { AreaSchema, LengthSchema } from "./provenance";
import {
  openingOnUnknownWall,
  openingPastWallEnd,
  openingTallerThanWall,
  studioPlan,
} from "../../../tests/fixtures/floor-plans";

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((i) => i.message) ?? [];

describe("FloorPlanSchema", () => {
  it("accepts a valid plan", () => {
    expect(FloorPlanSchema.safeParse(studioPlan).success).toBe(true);
  });

  it("rejects an opening that runs past the end of its wall", () => {
    const result = FloorPlanSchema.safeParse(openingPastWallEnd);
    expect(result.success).toBe(false);
    expect(messages(result)).toContain('Opening "o-window" runs past the end of wall "w-n"');
  });

  it("rejects an opening on an unknown wall", () => {
    const result = FloorPlanSchema.safeParse(openingOnUnknownWall);
    expect(messages(result)).toContain('Opening "o-door" references unknown wall "w-missing"');
  });

  it("rejects an opening taller than its wall", () => {
    const result = FloorPlanSchema.safeParse(openingTallerThanWall);
    expect(messages(result)).toContain('Opening "o-window" is taller than wall "w-n"');
  });
});

describe("RoomSchema", () => {
  it("requires at least 3 polygon points", () => {
    const room = {
      ...studioPlan.rooms[0]!,
      polygon: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    };
    expect(messages(RoomSchema.safeParse(room))).toContain("A polygon needs at least 3 points");
  });
});

describe("WallSchema", () => {
  it("rejects zero-length walls", () => {
    const wall = { ...studioPlan.walls[0]!, end: studioPlan.walls[0]!.start };
    expect(messages(WallSchema.safeParse(wall))).toContain("Wall start and end must differ");
  });

  it("rejects zero thickness", () => {
    const wall = {
      ...studioPlan.walls[0]!,
      thickness: { value: 0, unit: "m", provenance: "estimated" },
    };
    expect(messages(WallSchema.safeParse(wall))).toContain("Must be greater than 0");
  });
});

describe("dimension provenance", () => {
  it("requires a provenance flag on every dimension", () => {
    expect(LengthSchema.safeParse({ value: 2, unit: "m" }).success).toBe(false);
    expect(
      LengthSchema.safeParse({ value: 2, unit: "m", provenance: "measured-ish" }).success,
    ).toBe(false);
  });

  it("accepts an optional source note but rejects an empty one", () => {
    const base = { value: 2, unit: "m", provenance: "verified" } as const;
    expect(LengthSchema.safeParse({ ...base, source: "Plan A-102" }).success).toBe(true);
    expect(LengthSchema.safeParse({ ...base, source: "" }).success).toBe(false);
  });

  it("rejects non-positive areas and wrong units", () => {
    expect(AreaSchema.safeParse({ value: 0, unit: "m2", provenance: "estimated" }).success).toBe(
      false,
    );
    expect(AreaSchema.safeParse({ value: 10, unit: "m", provenance: "estimated" }).success).toBe(
      false,
    );
  });
});

describe("furniture validation", () => {
  const sofa = {
    id: "f-sofa",
    type: "sofa" as const,
    roomId: "r-living",
    position: { x: 3, y: 2 },
    rotation: 0,
  };

  it("accepts furniture inside its room, including pieces against a wall", () => {
    expect(FloorPlanSchema.safeParse({ ...studioPlan, furniture: [sofa] }).success).toBe(true);
    const againstWall = { ...sofa, position: { x: 3, y: 0.45 } };
    expect(FloorPlanSchema.safeParse({ ...studioPlan, furniture: [againstWall] }).success).toBe(
      true,
    );
  });

  it("rejects furniture in unknown rooms or sticking out of its room", () => {
    const unknown = FloorPlanSchema.safeParse({
      ...studioPlan,
      furniture: [{ ...sofa, roomId: "r-nope" }],
    });
    expect(messages(unknown)).toContain('Furniture "f-sofa" references unknown room "r-nope"');

    const outside = FloorPlanSchema.safeParse({
      ...studioPlan,
      furniture: [{ ...sofa, position: { x: 5.5, y: 2 } }],
    });
    expect(messages(outside)).toContain('Furniture "f-sofa" does not fit inside room "r-living"');
  });

  it("rejects unknown furniture types", () => {
    const bad = FloorPlanSchema.safeParse({
      ...studioPlan,
      furniture: [{ ...sofa, type: "piano" }],
    });
    expect(bad.success).toBe(false);
  });
});
