"use client";

import { useMemo } from "react";

import { polygonBounds } from "@/domain/geometry";
import type { Building } from "@/domain/types";

import { CameraRig } from "../camera/camera-rig";
import { buildingPose, cameraLimits } from "../camera/presets";
import { buildingLayout } from "../geometry/building-layout";
import { BuildingShell } from "../meshes/building-shell";
import { scenePalette } from "../palette";

export interface BuildingSceneProps {
  building: Building;
}

/** Lights, ground and the procedural building shell, framed by the orbit camera. */
export function BuildingScene({ building }: BuildingSceneProps) {
  const bounds = useMemo(() => polygonBounds(building.footprint), [building.footprint]);
  const roof = useMemo(() => buildingLayout(building).roof, [building]);
  const poses = useMemo(() => {
    if (!bounds) return null;
    const pose = buildingPose(bounds, roof);
    return { orbit: pose, top: pose };
  }, [bounds, roof]);
  const limits = useMemo(
    () => (bounds ? { ...cameraLimits(bounds), maxPolarAngle: Math.PI * 0.47 } : null),
    [bounds],
  );

  if (!bounds || !poses || !limits) return null;

  const cx = bounds.minX + bounds.width / 2;
  const cz = bounds.minY + bounds.height / 2;
  const span = Math.max(bounds.width, bounds.height, roof);

  return (
    <>
      <color attach="background" args={[scenePalette.ground]} />
      <hemisphereLight args={[scenePalette.wall, scenePalette.slab, 1.4]} />
      <directionalLight
        position={[cx + span * 0.6, span * 1.6, cz + span * 0.9]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
        shadow-camera-far={span * 4}
        shadow-bias={-0.0004}
      >
        <object3D attach="target" position={[cx, 0, cz]} />
      </directionalLight>

      <mesh rotation-x={-Math.PI / 2} position={[cx, 0, cz]} receiveShadow>
        <planeGeometry args={[span * 8, span * 8]} />
        <shadowMaterial opacity={0.1} />
      </mesh>

      <BuildingShell building={building} />

      <CameraRig mode="orbit" poses={poses} limits={limits} />
    </>
  );
}
