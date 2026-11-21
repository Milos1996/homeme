import type { Bounds } from "@/domain/geometry";

export type CameraMode = "orbit" | "top";

export interface CameraPose {
  /** World position of the camera. */
  readonly position: readonly [number, number, number];
  /** World point the camera looks at. */
  readonly target: readonly [number, number, number];
}

export interface CameraLimits {
  readonly minDistance: number;
  readonly maxDistance: number;
  /** Radians from straight down; keeps the camera above the floor. */
  readonly maxPolarAngle: number;
}

/** Vertical field of view used by the apartment camera, in degrees. */
export const CAMERA_FOV = 40;

/**
 * Camera poses framing a plan's bounds. Plan (x, y) maps to world (x, z).
 * - orbit: three-quarter view from the south-east, above wall height
 * - top: straight down, north at the top of the screen (matches the 2D plan)
 */
export function cameraPoses(bounds: Bounds, wallHeight: number): Record<CameraMode, CameraPose> {
  const cx = bounds.minX + bounds.width / 2;
  const cz = bounds.minY + bounds.height / 2;
  const span = Math.max(bounds.width, bounds.height);
  // Distance at which `span` fits the vertical FOV, with some breathing room.
  const fit = (span / 2 / Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180)) * 1.15;
  const target = [cx, 0, cz] as const;

  return {
    orbit: {
      position: [cx + fit * 0.55, wallHeight + fit * 0.75, cz + fit * 0.7],
      target: [cx, wallHeight * 0.25, cz],
    },
    // A tiny southward offset gives camera-controls a defined "up" (north) when looking straight down.
    top: { position: [cx, fit + wallHeight, cz + 0.001], target },
  };
}

export function cameraLimits(bounds: Bounds): CameraLimits {
  const span = Math.max(bounds.width, bounds.height);
  return {
    minDistance: Math.max(3, span * 0.35),
    maxDistance: span * 3,
    maxPolarAngle: Math.PI * 0.45,
  };
}
