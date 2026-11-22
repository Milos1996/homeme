import type { Building } from "@/domain/types";

/** Vertical make-up of one storey, in metres from the storey's base. */
export const STOREY = {
  slabThickness: 0.25,
  /** Window band starts this far above the slab top… */
  sill: 0.8,
  /** …and is this tall. */
  glazingHeight: 1.5,
  /** How far slab edges project beyond the facade. */
  slabProjection: 0.15,
  /** Glazing sits just proud of the facade to avoid z-fighting. */
  glazingOffset: 0.02,
  mullionSpacing: 1.6,
  parapetHeight: 0.4,
} as const;

export interface FloorLayout {
  readonly floorId: string;
  readonly level: number;
  /** World y of the storey's base (bottom of its slab). */
  readonly base: number;
}

export interface BuildingLayout {
  readonly storeyHeight: number;
  readonly plinthHeight: number;
  readonly floors: readonly FloorLayout[];
  /** World y of the roof (top of the last storey). */
  readonly roof: number;
}

/** Stacks floors by level on top of the raised ground floor plinth. */
export function buildingLayout(building: Building): BuildingLayout {
  const storeyHeight = building.floorToFloorHeight.value;
  const plinthHeight = building.groundFloorElevation.value;
  const floors = [...building.floors]
    .sort((a, b) => a.level - b.level)
    .map((f) => ({ floorId: f.id, level: f.level, base: plinthHeight + f.level * storeyHeight }));
  const top = floors.at(-1);
  return {
    storeyHeight,
    plinthHeight,
    floors,
    roof: top ? top.base + storeyHeight : plinthHeight,
  };
}
