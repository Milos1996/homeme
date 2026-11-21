import { FURNITURE_CATALOG } from "@/domain/geometry";
import type { FurnitureType } from "@/domain/types";

export type FurnitureFinish = "fabric" | "wood" | "ceramic" | "lacquer";

/** One box of a placeholder model, in the piece's local frame (metres, y up, back at −z). */
export interface FurniturePart {
  readonly size: readonly [number, number, number];
  readonly position: readonly [number, number, number];
  readonly finish: FurnitureFinish;
}

const box = (
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  finish: FurnitureFinish,
): FurniturePart => ({ size: [w, h, d], position: [x, y + h / 2, z], finish });

/** Low-poly box composition for each furniture type, sized from the catalog. */
export function furnitureParts(type: FurnitureType): FurniturePart[] {
  const { width: w, depth: d, height: h } = FURNITURE_CATALOG[type];

  switch (type) {
    case "bed-double":
    case "bed-single":
      return [
        box(w, 0.3, d, 0, 0, 0, "wood"),
        box(w * 0.96, 0.2, d * 0.94, 0, 0.3, 0.02, "fabric"),
        box(w, 0.9, 0.06, 0, 0, -d / 2 + 0.03, "wood"),
        box(w * 0.8, 0.1, 0.35, 0, 0.5, -d / 2 + 0.3, "lacquer"),
      ];
    case "sofa":
      return [
        box(w, 0.42, d, 0, 0, 0, "fabric"),
        box(w, 0.4, 0.22, 0, 0.42, -d / 2 + 0.11, "fabric"),
        box(0.18, 0.2, d, -w / 2 + 0.09, 0.42, 0, "fabric"),
        box(0.18, 0.2, d, w / 2 - 0.09, 0.42, 0, "fabric"),
      ];
    case "desk":
    case "dining-table":
    case "coffee-table": {
      const top = 0.04;
      const leg = 0.05;
      const legs = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ] as const;
      return [
        box(w, top, d, 0, h - top, 0, "wood"),
        ...legs.map(([sx, sz]) =>
          box(leg, h - top, leg, sx * (w / 2 - leg), 0, sz * (d / 2 - leg), "wood"),
        ),
      ];
    }
    case "kitchen-counter":
      return [
        box(w, h - 0.04, d, 0, 0, 0, "lacquer"),
        box(w, 0.04, d + 0.02, 0, h - 0.04, 0, "wood"),
      ];
    case "bathtub":
    case "washbasin":
    case "wc":
      return [box(w, h, d, 0, 0, 0, "ceramic")];
    case "wardrobe":
      return [box(w, h, d, 0, 0, 0, "lacquer")];
  }
}
