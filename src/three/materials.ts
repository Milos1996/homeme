import { MeshStandardMaterial, type MeshStandardMaterialParameters } from "three";

import { scenePalette } from "./palette";

/**
 * One material library for both 3D scenes, so walls, floors, glass and the
 * facade look the same everywhere. Materials are created lazily and shared
 * for the lifetime of the app: there are only a dozen, they are tiny, and
 * sharing them means switching views never recompiles shaders. This is the
 * one intentional exception to "dispose on unmount".
 */
const SPECS = {
  plaster: { color: scenePalette.wall, roughness: 0.92 },
  facade: { color: scenePalette.facade, roughness: 0.9 },
  facadeHover: { color: scenePalette.facadeHover, roughness: 0.9 },
  facadeSelected: { color: scenePalette.facadeSelected, roughness: 0.85 },
  concrete: { color: scenePalette.slab, roughness: 0.85 },
  oak: { color: scenePalette.floor, roughness: 0.75 },
  oakHighlight: { color: scenePalette.floorHighlight, roughness: 0.75 },
  glass: { color: scenePalette.glazing, roughness: 0.08, metalness: 0.25, envMapIntensity: 1.4 },
  glassHover: { color: scenePalette.glazingHover, roughness: 0.08, metalness: 0.25 },
  glassSelected: { color: scenePalette.glazingSelected, roughness: 0.12, metalness: 0.2 },
  fabric: { color: scenePalette.fabric, roughness: 0.95 },
  wood: { color: scenePalette.wood, roughness: 0.65 },
  ceramic: { color: scenePalette.ceramic, roughness: 0.25 },
  lacquer: { color: scenePalette.lacquer, roughness: 0.55 },
} satisfies Record<string, MeshStandardMaterialParameters>;

export type MaterialKey = keyof typeof SPECS;

const cache = new Map<MaterialKey, MeshStandardMaterial>();

export function material(key: MaterialKey): MeshStandardMaterial {
  let m = cache.get(key);
  if (!m) {
    m = new MeshStandardMaterial(SPECS[key]);
    m.name = key;
    cache.set(key, m);
  }
  return m;
}
