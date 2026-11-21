"use client";

import { useEffect, useMemo } from "react";
import { BoxGeometry } from "three";

import { polygonBounds } from "@/domain/geometry";
import type { Building } from "@/domain/types";

import { scenePalette } from "../palette";

interface BuildingFloorsProps {
  building: Building;
  /** Fraction of the floor-to-floor height used by the visible slab. */
  slabRatio?: number;
}

/**
 * Simple massing: one box per floor, sized from the footprint bounds and
 * stacked by floor-to-floor height. One geometry is shared by all floors
 * and disposed on unmount. Placeholder until the procedural shell (HOM-17).
 */
export function BuildingFloors({ building, slabRatio = 0.92 }: BuildingFloorsProps) {
  const bounds = polygonBounds(building.footprint);
  const width = bounds?.width ?? 0;
  const depth = bounds?.height ?? 0;
  const storey = building.floorToFloorHeight.value;
  const slabHeight = storey * slabRatio;
  const base = building.groundFloorElevation.value;

  const geometry = useMemo(
    () => new BoxGeometry(width, slabHeight, depth),
    [width, slabHeight, depth],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  if (!bounds) return null;

  return (
    <group name="building-floors">
      {building.floors.map((floor) => (
        <mesh
          key={floor.id}
          name={floor.id}
          geometry={geometry}
          position={[0, base + floor.level * storey + slabHeight / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={scenePalette.facade} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
