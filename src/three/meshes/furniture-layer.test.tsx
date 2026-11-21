import ReactThreeTestRenderer from "@react-three/test-renderer";
import { describe, expect, it } from "vitest";

import { typeA } from "@/data/projects/linden-court/floor-plans/type-a";

import { FurnitureLayer } from "./furniture-layer";

describe("FurnitureLayer", () => {
  it("renders one group per item, without shadow casting, on a shared geometry", async () => {
    const items = typeA.furniture!;
    const renderer = await ReactThreeTestRenderer.create(<FurnitureLayer items={items} />);

    const layer = renderer.scene.findByProps({ name: "furniture" });
    expect(layer.children).toHaveLength(items.length);

    const meshes = renderer.scene.findAllByType("Mesh");
    expect(meshes.every((m) => !m.instance.castShadow)).toBe(true);
    const geometries = new Set(meshes.map((m) => (m.props as { geometry: unknown }).geometry));
    expect(geometries.size).toBe(1);
  });

  it("rotates pieces from plan degrees to world radians", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <FurnitureLayer
        items={[
          { id: "s", type: "sofa", roomId: "living", position: { x: 2, y: 3 }, rotation: 90 },
        ]}
      />,
    );
    const piece = renderer.scene.findByProps({ name: "s" });
    expect(piece.instance.position.toArray()).toEqual([2, 0, 3]);
    expect(piece.instance.rotation.y).toBeCloseTo(-Math.PI / 2);
  });
});
