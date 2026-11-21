import { ExtrudeGeometry, Shape, type BufferGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import type { Prism } from "@/domain/geometry";
import type { Polygon } from "@/domain/types";

/** Thickness of the floor slab drawn under each room, in metres. */
export const FLOOR_SLAB_THICKNESS = 0.06;

const toShape = (polygon: Polygon): Shape => {
  const shape = new Shape();
  polygon.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, p.y) : shape.lineTo(p.x, p.y)));
  shape.closePath();
  return shape;
};

/**
 * Extrudes a plan polygon vertically between `bottom` and `top`.
 * Plan (x, y) maps to world (x, z); world y is up.
 */
export function extrudeFootprint(polygon: Polygon, bottom: number, top: number): BufferGeometry {
  const geometry = new ExtrudeGeometry(toShape(polygon), {
    depth: top - bottom,
    bevelEnabled: false,
  });
  // Shape lies in XY and extrudes along +Z. Rotating +90° about X maps
  // (x, y, z) → (x, −z, y): plan y becomes world z and the extrusion points down.
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, top, 0);
  return geometry;
}

/** All wall prisms merged into a single geometry (one draw call). */
export function buildWallGeometry(prisms: readonly Prism[]): BufferGeometry | null {
  if (prisms.length === 0) return null;
  const parts = prisms.map((p) => extrudeFootprint(p.footprint, p.bottom, p.top));
  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  return merged;
}

/** A thin slab under a room polygon, with its top face at floor level (y = 0). */
export function buildFloorSlab(polygon: Polygon): BufferGeometry {
  return extrudeFootprint(polygon, -FLOOR_SLAB_THICKNESS, 0);
}
