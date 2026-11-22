"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { BoxGeometry, MeshStandardMaterial, Object3D } from "three";
import type { BufferGeometry, InstancedMesh } from "three";

import { offsetPolygon, perimeterPoints } from "@/domain/geometry";
import type { Building } from "@/domain/types";

import { extrudeFootprint } from "../geometry/apartment-geometry";
import { buildingLayout, STOREY } from "../geometry/building-layout";
import { scenePalette } from "../palette";

interface BuildingShellProps {
  building: Building;
}

/**
 * Procedural building exterior from the footprint, floor count and storey
 * height: a plinth for the raised ground floor, then per floor a projecting
 * slab, a solid facade and a glazing band split into windows by mullions,
 * and a roof parapet. Each floor is its own group named by floor id.
 *
 * Every floor reuses the same three geometries; all mullions are one
 * InstancedMesh, so the whole building is ~3 draw calls per floor.
 */
export function BuildingShell({ building }: BuildingShellProps) {
  const layout = useMemo(() => buildingLayout(building), [building]);
  const { storeyHeight } = layout;
  const glazingBottom = STOREY.slabThickness + STOREY.sill;

  const geometries = useMemo(() => {
    const footprint = building.footprint;
    const projecting = offsetPolygon(footprint, STOREY.slabProjection);
    const glazingRing = offsetPolygon(footprint, STOREY.glazingOffset);
    return {
      plinth: extrudeFootprint(footprint, 0, layout.plinthHeight),
      slab: extrudeFootprint(projecting, 0, STOREY.slabThickness),
      facade: extrudeFootprint(footprint, STOREY.slabThickness, storeyHeight),
      glazing: extrudeFootprint(glazingRing, glazingBottom, glazingBottom + STOREY.glazingHeight),
      parapet: extrudeFootprint(projecting, 0, STOREY.parapetHeight),
      mullion: new BoxGeometry(0.16, STOREY.glazingHeight, 0.1),
    } satisfies Record<string, BufferGeometry>;
  }, [building.footprint, layout.plinthHeight, storeyHeight, glazingBottom]);

  const materials = useMemo(
    () => ({
      facade: new MeshStandardMaterial({ color: scenePalette.facade, roughness: 0.9 }),
      slab: new MeshStandardMaterial({ color: scenePalette.slab, roughness: 0.85 }),
      glazing: new MeshStandardMaterial({
        color: scenePalette.glazing,
        roughness: 0.15,
        metalness: 0.2,
      }),
    }),
    [],
  );

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
    [geometries, materials],
  );

  // Mullions: one instance per perimeter point per floor.
  const mullionSpots = useMemo(
    () =>
      perimeterPoints(
        offsetPolygon(building.footprint, STOREY.glazingOffset + 0.03),
        STOREY.mullionSpacing,
      ),
    [building.footprint],
  );
  const mullionCount = mullionSpots.length * layout.floors.length;
  const mullions = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = mullions.current;
    if (!mesh) return;
    const dummy = new Object3D();
    let i = 0;
    for (const floor of layout.floors) {
      for (const { point, angle } of mullionSpots) {
        dummy.position.set(point.x, floor.base + glazingBottom + STOREY.glazingHeight / 2, point.y);
        // Plan angle (clockwise in y-down plan) → rotation about world +Y is −angle.
        dummy.rotation.set(0, -angle, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [layout.floors, mullionSpots, glazingBottom]);

  return (
    <group name="building-shell">
      <mesh name="plinth" geometry={geometries.plinth} material={materials.slab} receiveShadow />

      {layout.floors.map((floor) => (
        <group
          key={floor.floorId}
          name={floor.floorId}
          userData={{ floorId: floor.floorId, level: floor.level }}
          position={[0, floor.base, 0]}
        >
          <mesh geometry={geometries.slab} material={materials.slab} castShadow receiveShadow />
          <mesh geometry={geometries.facade} material={materials.facade} castShadow receiveShadow />
          <mesh geometry={geometries.glazing} material={materials.glazing} />
        </group>
      ))}

      <mesh
        name="parapet"
        geometry={geometries.parapet}
        material={materials.slab}
        position={[0, layout.roof, 0]}
        castShadow
      />

      {mullionCount > 0 && (
        <instancedMesh
          ref={mullions}
          name="mullions"
          args={[geometries.mullion, materials.facade, mullionCount]}
        />
      )}
    </group>
  );
}
