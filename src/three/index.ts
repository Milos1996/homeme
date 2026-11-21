/**
 * Public, lightweight entry point for features. It must stay free of
 * static three.js imports so pages don't bundle WebGL code: scenes are
 * exposed through client-only lazy wrappers.
 */
export type { CameraMode } from "./camera/presets";
export { LazyApartmentCanvas } from "./lazy-apartment-canvas";
export { LazySceneCanvas } from "./lazy-scene-canvas";
export { scenePalette } from "./palette";
export { SceneLoading } from "./scene-loading";
export { useWebGLSupport } from "./use-webgl-support";
