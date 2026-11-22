import ReactThreeTestRenderer from "@react-three/test-renderer";
import { describe, expect, it, vi } from "vitest";

import { typeA } from "@/data/projects/linden-court/floor-plans/type-a";

import { ApartmentScene } from "./apartment-scene";

// Camera controls need a real DOM canvas; scene composition is what we test here.
vi.mock("../camera/camera-rig", () => ({ CameraRig: () => null }));
// The environment bakes a cube map with a real WebGL renderer; covered by e2e.
vi.mock("../studio-environment", () => ({ StudioEnvironment: () => null }));

describe("ApartmentScene", () => {
  it("composes lights, a shadow-catching ground and the apartment", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <ApartmentScene plan={typeA} cameraMode="orbit" showLabels={false} />,
    );

    const lights = renderer.scene.findAll((n) => /Light$/.test(n.type));
    expect(lights.map((l) => l.type).sort()).toEqual(["DirectionalLight", "HemisphereLight"]);
    expect(renderer.scene.findByType("DirectionalLight").props.castShadow).toBe(true);

    const meshes = renderer.scene.findAllByType("Mesh");
    // ground + merged walls + one slab per room
    expect(meshes).toHaveLength(1 + 1 + typeA.rooms.length);
  });
});
