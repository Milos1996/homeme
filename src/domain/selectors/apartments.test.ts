import { describe, expect, it } from "vitest";

import type { Apartment, Availability } from "../types";
import { countByAvailability, filterApartments } from "./apartments";

const make = (id: string, floorId: string, availability: Availability, roomCount: number) =>
  ({
    id,
    floorId,
    number: id,
    area: { value: 50, unit: "m2", provenance: "estimated" },
    roomCount,
    availability,
  }) satisfies Apartment;

const apartments = [
  make("a", "f1", "available", 2),
  make("b", "f1", "sold", 3),
  make("c", "f2", "reserved", 2),
  make("d", "f2", "available", 4),
];

describe("filterApartments", () => {
  it("returns everything for an empty filter", () => {
    expect(filterApartments(apartments, {})).toHaveLength(4);
    expect(filterApartments(apartments, { availability: [], roomCounts: [] })).toHaveLength(4);
  });

  it("combines floor, availability and room count criteria", () => {
    expect(filterApartments(apartments, { floorId: "f2" }).map((a) => a.id)).toEqual(["c", "d"]);
    expect(
      filterApartments(apartments, { availability: ["available", "reserved"] }).map((a) => a.id),
    ).toEqual(["a", "c", "d"]);
    expect(
      filterApartments(apartments, { floorId: "f1", roomCounts: [2] }).map((a) => a.id),
    ).toEqual(["a"]);
  });
});

describe("countByAvailability", () => {
  it("counts every state, defaulting to 0", () => {
    expect(countByAvailability(apartments)).toEqual({ available: 2, reserved: 1, sold: 1 });
    expect(countByAvailability([])).toEqual({ available: 0, reserved: 0, sold: 0 });
  });
});
