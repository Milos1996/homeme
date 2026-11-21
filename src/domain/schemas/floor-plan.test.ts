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
