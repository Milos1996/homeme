import { countByAvailability, filterApartments } from "@/domain/selectors";
import type { Apartment, Availability, Project } from "@/domain/types";

/** Serializable per-floor summary passed from the server to the explorer. */
export interface FloorSummary {
  readonly id: string;
  readonly level: number;
  readonly label: string;
  readonly total: number;
  readonly counts: Record<Availability, number>;
}

/** Floors from top to bottom with unit counts by availability. */
export function summarizeFloors(project: Project): FloorSummary[] {
  return [...project.building.floors]
    .sort((a, b) => b.level - a.level)
    .map((floor) => {
      const units = filterApartments(project.apartments, { floorId: floor.id });
      return {
        id: floor.id,
        level: floor.level,
        label: floor.label,
        total: units.length,
        counts: countByAvailability(units),
      };
    });
}

/** An apartment without its (heavy) floor plan, for lists on the client. */
export type UnitSummary = Omit<Apartment, "floorPlan"> & { readonly hasPlan: boolean };

export function summarizeUnits(project: Project): UnitSummary[] {
  return project.apartments.map(({ floorPlan, ...unit }) => ({
    ...unit,
    hasPlan: floorPlan !== undefined,
  }));
}
