import { describe, expect, it } from "vitest";

import { countByAvailability } from "@/domain/selectors";

import { apartments, generateInventory } from "./apartments";
import { floors } from "./building";
import { lindenCourt } from "./project";

const onFloor = (level: number) => apartments.filter((a) => a.floorId === floors[level]!.id);

describe("Linden Court inventory", () => {
  it("covers the raised ground floor plus floors 1–7", () => {
    expect(floors.map((f) => f.label)).toEqual([
      "Raised ground floor",
      ...[1, 2, 3, 4, 5, 6, 7].map((n) => `Floor ${n}`),
    ]);
    expect(onFloor(0)).toHaveLength(10);
    for (let level = 1; level <= 7; level++) expect(onFloor(level)).toHaveLength(13);
    expect(apartments).toHaveLength(101);
  });

  it("has unique ids and level.unit numbers", () => {
    expect(new Set(apartments.map((a) => a.id)).size).toBe(apartments.length);
    expect(apartments.find((a) => a.id === "lc-3-07")?.number).toBe("3.07");
    for (const a of apartments) expect(a.number).toMatch(/^[0-7]\.\d{2}$/);
  });

  it("has plausible areas and room counts, all estimated", () => {
    for (const a of apartments) {
      expect(a.area.provenance).toBe("estimated");
      expect(a.area.value).toBeGreaterThanOrEqual(30);
      expect(a.area.value).toBeLessThanOrEqual(90);
      expect([1, 2, 3, 4]).toContain(a.roomCount);
      // Bigger homes have more rooms.
      if (a.roomCount === 1) expect(a.area.value).toBeLessThan(40);
      if (a.roomCount === 4) expect(a.area.value).toBeGreaterThan(80);
    }
  });

  it("mixes available, reserved and sold units", () => {
    const counts = countByAvailability(apartments);
    expect(counts.available).toBeGreaterThan(30);
    expect(counts.reserved).toBeGreaterThan(10);
    expect(counts.sold).toBeGreaterThan(10);
  });

  it("prices some units, never sold ones, and rises with height", () => {
    const priced = apartments.filter((a) => a.price);
    expect(priced.length).toBeGreaterThan(40);
    expect(priced.length).toBeLessThan(apartments.length);
    expect(apartments.filter((a) => a.availability === "sold" && a.price)).toEqual([]);

    const perM2 = (level: number) => {
      const units = priced.filter((a) => a.floorId === floors[level]!.id);
      return units.reduce((s, a) => s + a.price!.amount / a.area.value, 0) / units.length;
    };
    expect(perM2(7)).toBeGreaterThan(perM2(1));
  });

  it("keeps the showcase unit 0.01 available with its full Type A plan", () => {
    const showcase = apartments.find((a) => a.id === "lc-0-01")!;
    expect(showcase.availability).toBe("available");
    expect(showcase.floorPlan).toBeDefined();
  });

  it("is deterministic and flagged as demo data", () => {
    expect(generateInventory()).toEqual(generateInventory());
    expect(lindenCourt.isDemo).toBe(true);
  });
});
