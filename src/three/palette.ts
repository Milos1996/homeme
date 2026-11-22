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
  wall: "#fbfaf7", // ≈ --paper
  floor: "#cdbb9e", // warm oak, between --stone-200 and --stone-400
  floorHighlight: "#c9d6cc", // ≈ --sage-300
  fabric: "#a9bcad", // ≈ --sage-500, softened
  wood: "#b59f84", // warm oak, darker than the floor
  ceramic: "#fdfcfa", // ≈ --paper
  lacquer: "#e9e4da", // ≈ --stone-200
  facadeHover: "#c9d6cc", // ≈ --sage-300
  facadeSelected: "#7d9a85", // between --sage-500 and --forest-600
  glazingHover: "#b3c6b8", // sage glass
  glazingSelected: "#5f7f69", // ≈ --forest-600
} as const;
