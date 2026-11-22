import { describe, expect, it } from "vitest";

import { getProject } from "@/data";

import { summarizeFloors } from "./floor-summary";
import { useExplorerStore } from "./store";

describe("summarizeFloors", () => {
  const floors = summarizeFloors(getProject("linden-court")!);

  it("lists floors from the top down with totals that add up", () => {
    expect(floors.map((f) => f.level)).toEqual([7, 6, 5, 4, 3, 2, 1, 0]);
    expect(floors.at(-1)).toMatchObject({ label: "Raised ground floor", total: 10 });
    for (const f of floors) {
      expect(f.counts.available + f.counts.reserved + f.counts.sold).toBe(f.total);
    }
    expect(floors.reduce((s, f) => s + f.total, 0)).toBe(101);
  });
});

describe("explorer store", () => {
  it("tracks hovered and selected floors and resets", () => {
    const s = useExplorerStore.getState();
    s.hoverFloor("a");
    s.selectFloor("b");
    expect(useExplorerStore.getState()).toMatchObject({
      hoveredFloorId: "a",
      selectedFloorId: "b",
    });
    s.reset();
    expect(useExplorerStore.getState()).toMatchObject({
      hoveredFloorId: null,
      selectedFloorId: null,
    });
  });
});
