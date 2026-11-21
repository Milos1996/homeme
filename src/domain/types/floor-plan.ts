import type { Length } from "./provenance";

/**
 * Plan coordinates are in metres on the horizontal plane.
 * `x` grows to the east, `y` grows to the south (SVG convention).
 * The 3D layer maps plan `y` to world `z`.
 */
export interface Point2 {
  readonly x: number;
  readonly y: number;
}

/** An ordered, non-self-intersecting ring of points. The closing edge is implicit. */
export type Polygon = readonly Point2[];

export type RoomType =
  | "living"
  | "kitchen"
  | "dining"
  | "bedroom"
  | "bathroom"
  | "wc"
  | "hallway"
  | "storage"
  | "balcony"
  | "other";

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly type: RoomType;
  readonly polygon: Polygon;
}

export interface Wall {
  readonly id: string;
  /** Centre-line start point. */
  readonly start: Point2;
  /** Centre-line end point. */
  readonly end: Point2;
  readonly thickness: Length;
  readonly height: Length;
  readonly exterior: boolean;
}

export type OpeningKind = "door" | "window";

/** A door or window positioned along a wall's centre line. */
export interface Opening {
  readonly id: string;
  readonly wallId: string;
  readonly kind: OpeningKind;
  /** Distance from the wall's `start` to the near edge of the opening. */
  readonly offset: Length;
  readonly width: Length;
  readonly height: Length;
  /** Height of the bottom edge above the floor. 0 for doors. */
  readonly sillHeight: Length;
}

export interface FloorPlan {
  readonly rooms: readonly Room[];
  readonly walls: readonly Wall[];
  readonly openings: readonly Opening[];
}
