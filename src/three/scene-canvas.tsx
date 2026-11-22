"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, type CanvasProps } from "@react-three/fiber";

export type SceneCanvasProps = Omit<CanvasProps, "frameloop" | "dpr" | "performance"> & {
  /** Accessible label describing the scene for screen readers. */
  label: string;
};

/**
 * Base R3F canvas with HomeMe performance defaults: on-demand rendering,
 * device pixel ratio capped at 1.5 and lowered while the camera moves
 * (AdaptiveDpr + controls regress), high-performance GPU hint, shadows on.
 * Never import this directly from a Server Component; use `LazySceneCanvas`.
 */
export default function SceneCanvas({ label, children, ...props }: SceneCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      performance={{ min: 0.6 }}
      gl={{ powerPreference: "high-performance", antialias: true }}
      shadows
      aria-label={label}
      role="img"
      {...props}
    >
      <AdaptiveDpr />
      {children}
    </Canvas>
  );
}
