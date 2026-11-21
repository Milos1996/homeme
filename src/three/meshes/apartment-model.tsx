"use client";

import { useEffect, useMemo } from "react";

import { floorPlanPrisms } from "@/domain/geometry";
import type { FloorPlan } from "@/domain/types";

import { buildFloorSlab, buildWallGeometry } from "../geometry/apartment-geometry";
import { scenePalette } from "../palette";

interface ApartmentModelProps {
  plan: FloorPlan;
  /** Room to highlight, e.g. the one hovered in the 2D plan. */
  highlightedRoomId?: string | null;
}

/**
 * 3D apartment generated from floor plan data: merged wall geometry with
 * openings cut out, plus one floor slab per room. Geometry is built once
 * per plan and disposed when the plan changes or the model unmounts.
 */
export function ApartmentModel({ plan, highlightedRoomId = null }: ApartmentModelProps) {
  const walls = useMemo(() => buildWallGeometry(floorPlanPrisms(plan)), [plan]);
  const floors = useMemo(
    () => plan.rooms.map((room) => ({ id: room.id, geometry: buildFloorSlab(room.polygon) })),
    [plan],
  );

  useEffect(() => () => walls?.dispose(), [walls]);
  useEffect(() => () => floors.forEach((f) => f.geometry.dispose()), [floors]);

  return (
    <group name="apartment">
      {walls && (
        <mesh name="walls" geometry={walls} castShadow receiveShadow>
          <meshStandardMaterial color={scenePalette.wall} roughness={0.92} />
        </mesh>
      )}
      <group name="floors">
        {floors.map(({ id, geometry }) => (
          <mesh key={id} name={`floor-${id}`} geometry={geometry} receiveShadow>
            <meshStandardMaterial
              color={id === highlightedRoomId ? scenePalette.floorHighlight : scenePalette.floor}
              roughness={0.85}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
