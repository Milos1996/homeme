import type { Building, Floor } from "@/domain/types";

/** Raised ground floor (level 0) plus floors 1–7. */
export const floors: Floor[] = Array.from({ length: 8 }, (_, level) => ({
  id: `linden-court-l${level}`,
  level,
  label: level === 0 ? "Raised ground floor" : `Floor ${level}`,
}));

/**
 * Placeholder massing. All dimensions are estimates until the reference
 * building's drawings are available (see HOM-23).
 */
export const building: Building = {
  footprint: [
    { x: 0, y: 0 },
    { x: 62, y: 0 },
    { x: 62, y: 16 },
    { x: 0, y: 16 },
  ],
  floorToFloorHeight: { value: 3.0, unit: "m", provenance: "estimated" },
  groundFloorElevation: { value: 1.2, unit: "m", provenance: "estimated" },
  floors,
};
