/**
 * Scene colours for three.js materials, which can't read CSS variables.
 * Keep these in sync with the tokens in `src/app/globals.css`. This is the
 * only place where 3D colours are defined.
 */
export const scenePalette = {
  facade: "#f4f1ea", // ≈ --paper / --stone-100
  slab: "#e6e1d6", // ≈ --stone-200
  glazing: "#c9d6cc", // ≈ --sage-300
  highlight: "#5f7f69", // ≈ --forest-600
  selected: "#47664f", // ≈ --forest-700
  ground: "#f7f4ee", // ≈ --warm-white
} as const;
