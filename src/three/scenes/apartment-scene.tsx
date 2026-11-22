"use client";

import { Html } from "@react-three/drei";
import { useMemo, type RefObject } from "react";

import { polygonBounds, polygonCentroid } from "@/domain/geometry";
import type { FloorPlan } from "@/domain/types";

import { CameraRig } from "../camera/camera-rig";
import { cameraLimits, cameraPoses, type CameraMode } from "../camera/presets";
import { ApartmentModel } from "../meshes/apartment-model";
import { FurnitureLayer } from "../meshes/furniture-layer";
import { scenePalette } from "../palette";

export interface ApartmentSceneProps {
  plan: FloorPlan;
  cameraMode: CameraMode;
  highlightedRoomId?: string | null;
  showLabels?: boolean;
  showFurniture?: boolean;
  onRoomSelect?: (roomId: string) => void;
  /**
   * DOM layer over the canvas that room labels render into. Passing a stable
   * element avoids drei's Html re-parenting labels when R3F connects events.
   */
  labelLayer?: RefObject<HTMLElement | null>;
}

/** Lights, ground, the generated apartment, floating room labels and the camera rig. */
export function ApartmentScene({
  plan,
  cameraMode,
  highlightedRoomId = null,
  showLabels = true,
  showFurniture = false,
  labelLayer,
  onRoomSelect,
}: ApartmentSceneProps) {
  const bounds = useMemo(
    () =>
      polygonBounds(
        ...plan.rooms.map((r) => r.polygon),
        ...plan.walls.map((w) => [w.start, w.end]),
      ),
    [plan],
  );
  const wallHeight = Math.max(...plan.walls.map((w) => w.height.value), 2.5);
  const poses = useMemo(
    () => (bounds ? cameraPoses(bounds, wallHeight) : null),
    [bounds, wallHeight],
  );
  const limits = useMemo(() => (bounds ? cameraLimits(bounds) : null), [bounds]);
  const labels = useMemo(
    () =>
      plan.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        at: polygonCentroid(room.polygon),
      })),
    [plan],
  );

  if (!bounds || !poses || !limits) return null;

  const cx = bounds.minX + bounds.width / 2;
  const cz = bounds.minY + bounds.height / 2;
  const span = Math.max(bounds.width, bounds.height);

  return (
    <>
      <color attach="background" args={[scenePalette.ground]} />
      <hemisphereLight args={[scenePalette.wall, scenePalette.slab, 1.5]} />
      <directionalLight
        position={[cx + span * 0.35, span * 2.4, cz + span * 0.6]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
        shadow-bias={-0.0005}
      >
        <object3D attach="target" position={[cx, 0, cz]} />
      </directionalLight>

      <mesh rotation-x={-Math.PI / 2} position={[cx, -0.07, cz]} receiveShadow>
        <planeGeometry args={[span * 4, span * 4]} />
        <shadowMaterial opacity={0.08} />
      </mesh>

      <ApartmentModel
        plan={plan}
        highlightedRoomId={highlightedRoomId}
        {...(onRoomSelect ? { onRoomSelect } : {})}
      />

      {showFurniture && plan.furniture && plan.furniture.length > 0 && (
        <FurnitureLayer items={plan.furniture} />
      )}

      {showLabels &&
        labels.map((label) => (
          <Html
            key={label.id}
            position={[label.at.x, 0.05, label.at.y]}
            center
            {...(labelLayer ? { portal: labelLayer as RefObject<HTMLElement> } : {})}
            zIndexRange={[20, 0]}
            className="pointer-events-none"
          >
            <span
              data-room-label={label.id}
              className={
                label.id === highlightedRoomId
                  ? "rounded-full bg-forest-700 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-warm-white shadow-soft"
                  : "rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-foreground shadow-soft backdrop-blur-sm"
              }
            >
              {label.name}
            </span>
          </Html>
        ))}

      <CameraRig pose={poses[cameraMode]} limits={limits} />
    </>
  );
}
