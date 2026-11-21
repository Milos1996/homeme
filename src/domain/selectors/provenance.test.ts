import { describe, expect, it } from "vitest";

import { countProvenance, floorPlanDimensions, isFullyVerified } from "./provenance";
import { studioPlan } from "../../../tests/fixtures/floor-plans";

describe("provenance selectors", () => {
  it("collects every wall and opening dimension", () => {
    // 4 walls × 2 + 2 openings × 4
    expect(floorPlanDimensions(studioPlan)).toHaveLength(16);
  });

  it("counts verified and estimated dimensions", () => {
    // The fixture's window has a verified offset and width.
    expect(countProvenance(floorPlanDimensions(studioPlan))).toEqual({
      verified: 2,
      estimated: 14,
    });
  });

  it("only treats a plan as verified when every dimension is verified", () => {
    expect(isFullyVerified(studioPlan)).toBe(false);
    expect(isFullyVerified({ rooms: [], walls: [], openings: [] })).toBe(false);

    const verify = <T extends { provenance: string }>(d: T) => ({
      ...d,
      provenance: "verified" as const,
    });
    const allVerified = {
      ...studioPlan,
      walls: studioPlan.walls.map((w) => ({
        ...w,
        thickness: verify(w.thickness),
        height: verify(w.height),
      })),
      openings: studioPlan.openings.map((o) => ({
        ...o,
        offset: verify(o.offset),
        width: verify(o.width),
        height: verify(o.height),
        sillHeight: verify(o.sillHeight),
      })),
    };
    expect(isFullyVerified(allVerified)).toBe(true);
  });
});
