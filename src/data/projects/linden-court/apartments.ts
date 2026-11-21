import type { Apartment, Availability, FloorPlan } from "@/domain/types";

import { floors } from "./building";
import { typeA } from "./floor-plans/type-a";

/**
 * Fictional demo inventory for Linden Court: 10 units on the raised
 * ground floor (the lobby takes space) and 13 on each of floors 1–7.
 *
 * Generated deterministically from a fixed seed so the data is stable
 * between builds. Every area is ESTIMATED and the whole dataset is demo
 * content (`isDemo: true` on the project).
 */

interface UnitType {
  readonly rooms: number;
  /** Area range in m²; Type A uses its plan's exact (estimated) area. */
  readonly area: readonly [number, number];
  /** Premium per m² on top of the base rate, in EUR. */
  readonly premium: number;
  readonly floorPlan?: FloorPlan;
}

const TYPES: Record<"A" | "B" | "C" | "D", UnitType> = {
  A: { rooms: 3, area: [63, 63], premium: 150, floorPlan: typeA }, // 2-bed corner, full layout
  B: { rooms: 1, area: [30, 36], premium: 350 }, // studio
  C: { rooms: 2, area: [44, 52], premium: 200 }, // 1-bed
  D: { rooms: 4, area: [82, 90], premium: 100 }, // 3-bed
};

/** Unit type for each position along the central corridor. */
const GROUND_FLOOR = ["A", "C", "B", "C", "C", "B", "C", "C", "B", "A"] as const;
const TYPICAL_FLOOR = ["A", "B", "C", "C", "B", "C", "D", "A", "C", "B", "C", "C", "D"] as const;

const BASE_RATE = 3200; // EUR per m² on the raised ground floor
const RATE_PER_LEVEL = 90; // EUR per m² for each level up
const SEED = 20261121;

/** Small deterministic PRNG (mulberry32). */
function createRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateInventory(seed = SEED): Apartment[] {
  const random = createRandom(seed);

  return floors.flatMap((floor) => {
    const layout = floor.level === 0 ? GROUND_FLOOR : TYPICAL_FLOOR;

    return layout.map((code, index): Apartment => {
      const type = TYPES[code];
      const slot = String(index + 1).padStart(2, "0");
      const [min, max] = type.area;
      const area = Math.round((min + random() * (max - min)) * 2) / 2;

      // Higher floors sell faster.
      const roll = random();
      const soldChance = 0.15 + floor.level * 0.035;
      let availability: Availability =
        roll < soldChance ? "sold" : roll < soldChance + 0.18 ? "reserved" : "available";
      // Keep the showcase unit (0.01, Type A with a full plan) available.
      if (floor.level === 0 && index === 0) availability = "available";

      const onRequest = random() < 0.12;
      const rate = BASE_RATE + floor.level * RATE_PER_LEVEL + type.premium;
      const showPrice = availability !== "sold" && !onRequest;

      return {
        id: `lc-${floor.level}-${slot}`,
        floorId: floor.id,
        number: `${floor.level}.${slot}`,
        area: { value: area, unit: "m2", provenance: "estimated" },
        roomCount: type.rooms,
        availability,
        ...(showPrice
          ? { price: { amount: Math.round((area * rate) / 1000) * 1000, currency: "EUR" } }
          : {}),
        ...(type.floorPlan ? { floorPlan: type.floorPlan } : {}),
      };
    });
  });
}

export const apartments: Apartment[] = generateInventory();
