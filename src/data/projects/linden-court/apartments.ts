import type { Apartment } from "@/domain/types";

import { typeA } from "./floor-plans/type-a";

/**
 * Fictional demo inventory. A single sample unit with a full Type A layout for now; the full
 * inventory (~13 units per floor) is tracked in HOM-16.
 */
export const apartments: Apartment[] = [
  {
    id: "lc-0-01",
    floorId: "linden-court-l0",
    number: "0.01",
    area: { value: 63, unit: "m2", provenance: "estimated" },
    roomCount: 3,
    availability: "available",
    floorPlan: typeA,
  },
];
