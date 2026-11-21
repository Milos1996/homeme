"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";

export type SceneCanvasProps = Omit<CanvasProps, "frameloop" | "dpr"> & {
  /** Accessible label describing the scene for screen readers. */
  label: string;
};

/**
 * Base R3F canvas with HomeMe performance defaults:
 * on-demand rendering, capped device pixel ratio and shadows enabled.
 * Never import this directly from a Server Component; use `LazySceneCanvas`.
 */
export default function SceneCanvas({ label, children, ...props }: SceneCanvasProps) {
  return (
    <Canvas frameloop="demand" dpr={[1, 2]} shadows aria-label={label} role="img" {...props}>
      {children}
    </Canvas>
  );
}
