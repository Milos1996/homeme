"use client";

import SceneCanvas from "../scene-canvas";
import { BuildingScene, type BuildingSceneProps } from "./building-scene";

export type BuildingCanvasProps = BuildingSceneProps & { label: string };

/** Canvas + building scene, loaded together as one client-only chunk. */
export default function BuildingCanvas({ label, ...scene }: BuildingCanvasProps) {
  return (
    <SceneCanvas label={label} camera={{ fov: 40, near: 0.5, far: 1000 }}>
      <BuildingScene {...scene} />
    </SceneCanvas>
  );
}
