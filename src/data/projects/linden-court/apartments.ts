import type { Apartment } from "@/domain/types";

/**
 * Fictional demo inventory. A single placeholder unit for now; the full
 * inventory (~13 units per floor) is tracked in HOM-16.
 */
export const apartments: Apartment[] = [
  {
    id: "lc-0-01",
    floorId: "linden-court-l0",
    number: "0.01",
    area: { value: 54.5, unit: "m2", provenance: "estimated" },
    roomCount: 2,
    availability: "available",
  },
];
