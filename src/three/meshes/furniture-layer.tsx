"use client";

import { useEffect, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial } from "three";

import type { FurnitureItem } from "@/domain/types";

import { furnitureParts, type FurnitureFinish } from "../geometry/furniture-parts";
import { scenePalette } from "../palette";

interface FurnitureLayerProps {
  items: readonly FurnitureItem[];
}

/**
 * Placeholder furniture from plan data. Every part reuses one unit box
 * scaled to size and one of four shared materials. Furniture doesn't cast
 * shadows, to keep the shadow pass cheap.
 */
export function FurnitureLayer({ items }: FurnitureLayerProps) {
  const unitBox = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const materials = useMemo<Record<FurnitureFinish, MeshStandardMaterial>>(
    () => ({
      fabric: new MeshStandardMaterial({ color: scenePalette.fabric, roughness: 0.95 }),
      wood: new MeshStandardMaterial({ color: scenePalette.wood, roughness: 0.7 }),
      ceramic: new MeshStandardMaterial({ color: scenePalette.ceramic, roughness: 0.3 }),
      lacquer: new MeshStandardMaterial({ color: scenePalette.lacquer, roughness: 0.6 }),
    }),
    [],
  );

  useEffect(
    () => () => {
      unitBox.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    },
    [unitBox, materials],
  );

  return (
    <group name="furniture">
      {items.map((item) => (
        <group
          key={item.id}
          name={item.id}
          position={[item.position.x, 0, item.position.y]}
          // Plan rotation is clockwise in a y-down plan; around world +Y that is −θ.
          rotation-y={(-item.rotation * Math.PI) / 180}
        >
          {furnitureParts(item.type).map((part, i) => (
            <mesh
              key={i}
              geometry={unitBox}
              material={materials[part.finish]}
              position={part.position as [number, number, number]}
              scale={part.size as [number, number, number]}
              receiveShadow
            />
          ))}
        </group>
      ))}
    </group>
  );
}
