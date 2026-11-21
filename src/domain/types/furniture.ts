import type { Point2 } from "./floor-plan";

export type FurnitureType =
  | "bed-double"
  | "bed-single"
  | "wardrobe"
  | "desk"
  | "sofa"
  | "coffee-table"
  | "dining-table"
  | "kitchen-counter"
  | "bathtub"
  | "washbasin"
  | "wc";

/**
 * An illustrative furniture placement. Furniture shows how a room can be
 * used; it is not part of the apartment's measured data, so it carries no
 * provenance.
 */
export interface FurnitureItem {
  readonly id: string;
  readonly type: FurnitureType;
  readonly roomId: string;
  /** Centre of the piece in plan coordinates (metres). */
  readonly position: Point2;
  /** Clockwise rotation in plan view, in degrees. 0 = width along x, depth along y. */
  readonly rotation: number;
}
