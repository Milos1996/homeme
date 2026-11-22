"use client";

import { useRef } from "react";

import SceneCanvas from "../scene-canvas";
import { BuildingScene, type BuildingSceneProps } from "./building-scene";

export type BuildingCanvasProps = Omit<BuildingSceneProps, "labelLayer"> & { label: string };

/** Canvas + building scene, loaded together as one client-only chunk. */
export default function BuildingCanvas({ label, ...scene }: BuildingCanvasProps) {
  const labelLayer = useRef<HTMLDivElement>(null);

  return (
    <div className="relative size-full">
      <SceneCanvas label={label} camera={{ fov: 40, near: 0.5, far: 1000 }}>
        <BuildingScene {...scene} labelLayer={labelLayer} />
      </SceneCanvas>
      <div ref={labelLayer} aria-hidden className="pointer-events-none absolute inset-0" />
    </div>
  );
}
