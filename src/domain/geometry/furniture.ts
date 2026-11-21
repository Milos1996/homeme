import type { FurnitureItem, FurnitureType, Polygon } from "../types";

export interface FurnitureSize {
  /** Along the piece's local x axis (metres). */
  readonly width: number;
  /** Along the piece's local y axis (metres). The "back" is at −depth/2. */
  readonly depth: number;
  readonly height: number;
}

/** Typical placeholder sizes per furniture type. */
export const FURNITURE_CATALOG: Record<FurnitureType, FurnitureSize> = {
  "bed-double": { width: 1.6, depth: 2.0, height: 0.5 },
  "bed-single": { width: 0.9, depth: 2.0, height: 0.5 },
  wardrobe: { width: 1.8, depth: 0.6, height: 2.1 },
  desk: { width: 1.2, depth: 0.6, height: 0.75 },
  sofa: { width: 2.2, depth: 0.9, height: 0.8 },
  "coffee-table": { width: 1.0, depth: 0.6, height: 0.4 },
  "dining-table": { width: 0.9, depth: 0.9, height: 0.75 },
  "kitchen-counter": { width: 2.8, depth: 0.6, height: 0.9 },
  bathtub: { width: 0.75, depth: 1.7, height: 0.55 },
  washbasin: { width: 0.6, depth: 0.45, height: 0.85 },
  wc: { width: 0.4, depth: 0.65, height: 0.45 },
};

/** Plan-space footprint (rotated rectangle) of a furniture item. */
export function furnitureFootprint(item: FurnitureItem): Polygon {
  const { width, depth } = FURNITURE_CATALOG[item.type];
  const rad = (item.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners: [number, number][] = [
    [-width / 2, -depth / 2],
    [width / 2, -depth / 2],
    [width / 2, depth / 2],
    [-width / 2, depth / 2],
  ];
  return corners.map(([x, y]) => ({
    x: item.position.x + x * cos - y * sin,
    y: item.position.y + x * sin + y * cos,
  }));
}
