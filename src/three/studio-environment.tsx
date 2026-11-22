"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Procedural studio environment: a few soft area lights baked once into a
 * small cube map (64 px, rendered a single frame). Gives glass and painted
 * surfaces soft reflections without downloading an HDR file.
 */
export function StudioEnvironment() {
  return (
    <Environment resolution={64} frames={1} environmentIntensity={0.35}>
      <Lightformer
        form="rect"
        intensity={2.2}
        position={[0, 6, 0]}
        rotation-x={Math.PI / 2}
        scale={[12, 12, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1}
        position={[-6, 2, 3]}
        rotation-y={Math.PI / 2}
        scale={[8, 3, 1]}
      />
      <Lightformer
        form="rect"
        intensity={0.8}
        position={[6, 2, -3]}
        rotation-y={-Math.PI / 2}
        scale={[8, 3, 1]}
      />
    </Environment>
  );
}
