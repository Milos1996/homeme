import type { FloorPlan, Polygon } from "./floor-plan";
import type { Area, Length } from "./provenance";

export type Availability = "available" | "reserved" | "sold";

export interface Price {
  readonly amount: number;
  /** ISO 4217 code, e.g. "EUR". */
  readonly currency: string;
}

export interface Apartment {
  readonly id: string;
  readonly floorId: string;
  /** Human-facing unit number, e.g. "3.07". */
  readonly number: string;
  readonly area: Area;
  readonly roomCount: number;
  readonly availability: Availability;
  readonly price?: Price;
  /** Detailed layout. Absent until a plan exists for this unit. */
  readonly floorPlan?: FloorPlan;
}

export interface Floor {
  readonly id: string;
  /** 0 = raised ground floor, 1..n above it. */
  readonly level: number;
  readonly label: string;
}

export interface Building {
  readonly footprint: Polygon;
  readonly floorToFloorHeight: Length;
  /** Height of the raised ground floor slab above street level. */
  readonly groundFloorElevation: Length;
  readonly floors: readonly Floor[];
}

export interface Project {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly summary: string;
  /** True when the project and its inventory are fictional demo content. */
  readonly isDemo: boolean;
  readonly building: Building;
  readonly apartments: readonly Apartment[];
}
