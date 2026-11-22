"use client";

import { useEffect, useMemo } from "react";
import { BoxGeometry } from "three";
import type { MeshStandardMaterial } from "three";

import type { FurnitureItem } from "@/domain/types";

import { furnitureParts, type FurnitureFinish } from "../geometry/furniture-parts";
import { material } from "../materials";

interface FurnitureLayerProps {
  items: readonly FurnitureItem[];
}

/**
 * Placeholder furniture from plan data. Every part reuses one unit box
 * scaled to size and one of four shared library materials. Furniture doesn't cast
 * shadows, to keep the shadow pass cheap.
 */
export function FurnitureLayer({ items }: FurnitureLayerProps) {
  const unitBox = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const materials: Record<FurnitureFinish, MeshStandardMaterial> = {
    fabric: material("fabric"),
    wood: material("wood"),
    ceramic: material("ceramic"),
    lacquer: material("lacquer"),
  };

  useEffect(() => () => unitBox.dispose(), [unitBox]);

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
