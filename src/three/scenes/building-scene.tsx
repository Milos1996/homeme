"use client";

import { Html } from "@react-three/drei";
import { useMemo, type RefObject } from "react";

import { polygonBounds } from "@/domain/geometry";
import type { Building } from "@/domain/types";

import { CameraRig } from "../camera/camera-rig";
import { buildingPose, cameraLimits } from "../camera/presets";
import { buildingLayout } from "../geometry/building-layout";
import { BuildingShell } from "../meshes/building-shell";
import { scenePalette } from "../palette";
import { StudioEnvironment } from "../studio-environment";

/** What the hover tooltip says about each floor. */
export interface FloorInfo {
  readonly label: string;
  readonly available: number;
}

export interface BuildingSceneProps {
  building: Building;
  floorInfo?: Readonly<Record<string, FloorInfo>>;
  hoveredFloorId?: string | null;
  selectedFloorId?: string | null;
  onFloorHover?: (floorId: string | null) => void;
  onFloorSelect?: (floorId: string) => void;
  /** Stable DOM layer over the canvas for the tooltip (see apartment scene). */
  labelLayer?: RefObject<HTMLElement | null>;
}

/**
 * Lights, ground and the procedural building shell. Hovering a floor shows
 * a tooltip; selecting one glides the camera to frame it.
 */
export function BuildingScene({
  building,
  floorInfo = {},
  hoveredFloorId = null,
  selectedFloorId = null,
  onFloorHover,
  onFloorSelect,
  labelLayer,
}: BuildingSceneProps) {
  const bounds = useMemo(() => polygonBounds(building.footprint), [building.footprint]);
  const layout = useMemo(() => buildingLayout(building), [building]);
  const selected = layout.floors.find((f) => f.floorId === selectedFloorId);
  const hovered = layout.floors.find((f) => f.floorId === hoveredFloorId);

  const pose = useMemo(() => {
    if (!bounds) return null;
    return selected
      ? buildingPose(bounds, layout.roof, {
          focusY: selected.base + layout.storeyHeight / 2,
          zoom: 0.85,
        })
      : buildingPose(bounds, layout.roof);
  }, [bounds, layout, selected]);
  const limits = useMemo(
    () => (bounds ? { ...cameraLimits(bounds), maxPolarAngle: Math.PI * 0.47 } : null),
    [bounds],
  );

  if (!bounds || !pose || !limits) return null;

  const cx = bounds.minX + bounds.width / 2;
  const cz = bounds.minY + bounds.height / 2;
  const span = Math.max(bounds.width, bounds.height, layout.roof);
  const tooltip = hovered && floorInfo[hovered.floorId];

  return (
    <>
      <color attach="background" args={[scenePalette.ground]} />
      <hemisphereLight args={[scenePalette.wall, scenePalette.slab, 1.05]} />
      <StudioEnvironment />
      <directionalLight
        position={[cx + span * 0.6, span * 1.6, cz + span * 0.9]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
        shadow-camera-far={span * 4}
        shadow-bias={-0.0004}
      >
        <object3D attach="target" position={[cx, 0, cz]} />
      </directionalLight>

      <mesh rotation-x={-Math.PI / 2} position={[cx, 0, cz]} receiveShadow raycast={() => null}>
        <planeGeometry args={[span * 8, span * 8]} />
        <shadowMaterial opacity={0.1} />
      </mesh>

      <BuildingShell
        building={building}
        hoveredFloorId={hoveredFloorId}
        selectedFloorId={selectedFloorId}
        {...(onFloorHover ? { onFloorHover } : {})}
        {...(onFloorSelect ? { onFloorSelect } : {})}
      />

      {hovered && tooltip && (
        <Html
          position={[bounds.maxX, hovered.base + layout.storeyHeight / 2, bounds.maxY]}
          zIndexRange={[30, 0]}
          className="pointer-events-none"
          {...(labelLayer ? { portal: labelLayer as RefObject<HTMLElement> } : {})}
        >
          <div
            data-floor-tooltip={hovered.floorId}
            className="ml-3 -translate-y-1/2 rounded-2xl bg-paper/95 px-3 py-2 whitespace-nowrap shadow-raised backdrop-blur-sm"
          >
            <p className="text-sm font-medium text-foreground">{tooltip.label}</p>
            <p className="text-xs text-muted-foreground">
              {tooltip.available === 1 ? "1 available" : `${tooltip.available} available`}
            </p>
          </div>
        </Html>
      )}

      <CameraRig pose={pose} limits={limits} />
    </>
  );
}
