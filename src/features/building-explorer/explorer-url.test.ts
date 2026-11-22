import { describe, expect, it } from "vitest";

import { buildExplorerSearch, explorerHref, parseExplorerSearch } from "./explorer-url";

const floors = [0, 1, 2, 3].map((level) => ({ id: `f${level}`, level }));

describe("explorer URL", () => {
  it("parses floor, status and rooms and ignores junk", () => {
    expect(parseExplorerSearch("?floor=3&status=available,sold&rooms=1,3", floors)).toEqual({
      floorId: "f3",
      availability: ["available", "sold"],
      rooms: [1, 3],
    });
    expect(parseExplorerSearch("?floor=9&status=maybe&rooms=x,0,-1,2.5", floors)).toEqual({
      floorId: null,
      availability: [],
      rooms: [],
    });
    expect(parseExplorerSearch("?floor=", floors).floorId).toBeNull();
    expect(parseExplorerSearch("?floor=0", floors).floorId).toBe("f0");
  });

  it("builds a minimal query and keeps unrelated params", () => {
    expect(
      buildExplorerSearch({ floorId: "f2", availability: ["available"], rooms: [2, 3] }, floors),
    ).toBe("?floor=2&status=available&rooms=2%2C3");
    expect(
      buildExplorerSearch({ floorId: null, availability: [], rooms: [] }, floors, "?utm=x&floor=1"),
    ).toBe("?utm=x");
  });

  it("round-trips", () => {
    const state = { floorId: "f1", availability: ["reserved" as const], rooms: [4] };
    expect(parseExplorerSearch(buildExplorerSearch(state, floors), floors)).toEqual(state);
  });

  it("links to the explorer, optionally on a floor", () => {
    expect(explorerHref("linden-court")).toBe("/projects/linden-court");
    expect(explorerHref("linden-court", 0)).toBe("/projects/linden-court?floor=0");
  });
});
