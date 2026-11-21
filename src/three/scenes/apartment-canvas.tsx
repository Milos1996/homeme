"use client";

import { useRef } from "react";

import SceneCanvas from "../scene-canvas";
import { ApartmentScene, type ApartmentSceneProps } from "./apartment-scene";

export type ApartmentCanvasProps = Omit<ApartmentSceneProps, "labelLayer"> & { label: string };

/**
 * Canvas + apartment scene, loaded together as one client-only chunk.
 * Room labels render into a stable overlay layer we own (see `labelLayer`).
 */
export default function ApartmentCanvas({ label, ...scene }: ApartmentCanvasProps) {
  const labelLayer = useRef<HTMLDivElement>(null);

  return (
    <div className="relative size-full">
      <SceneCanvas label={label} camera={{ fov: 40, near: 0.1, far: 200 }}>
        <ApartmentScene {...scene} labelLayer={labelLayer} />
      </SceneCanvas>
      <div ref={labelLayer} aria-hidden className="pointer-events-none absolute inset-0" />
    </div>
  );
}
