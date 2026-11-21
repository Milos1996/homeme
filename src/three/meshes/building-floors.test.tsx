import ReactThreeTestRenderer from "@react-three/test-renderer";
import type { Mesh } from "three";
import { describe, expect, it } from "vitest";

import type { Building } from "@/domain/types";

import { BuildingFloors } from "./building-floors";

const building: Building = {
  footprint: [
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 20, y: 10 },
    { x: 0, y: 10 },
  ],
  floorToFloorHeight: { value: 3, unit: "m", provenance: "estimated" },
  groundFloorElevation: { value: 1.2, unit: "m", provenance: "estimated" },
  floors: Array.from({ length: 8 }, (_, level) => ({
    id: `f-${level}`,
    level,
    label: `Floor ${level}`,
  })),
};

describe("BuildingFloors", () => {
  it("renders one mesh per floor, stacked by floor-to-floor height", async () => {
    const renderer = await ReactThreeTestRenderer.create(<BuildingFloors building={building} />);
    const meshes = renderer.scene.findAllByType("Mesh");

    expect(meshes).toHaveLength(8);
    const [ground, top] = [meshes[0]!, meshes[7]!];
    expect(ground.props.name).toBe("f-0");
    // top.y - ground.y = 7 storeys × 3 m
    expect(top.instance.position.y - ground.instance.position.y).toBeCloseTo(21);
  });

  it("shares a single geometry across floors", async () => {
    const renderer = await ReactThreeTestRenderer.create(<BuildingFloors building={building} />);
    const geometries = new Set(
      renderer.scene.findAllByType("Mesh").map((m) => (m.instance as Mesh).geometry.uuid),
    );
    expect(geometries.size).toBe(1);
  });
});
