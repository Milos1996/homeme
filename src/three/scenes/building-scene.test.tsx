import ReactThreeTestRenderer from "@react-three/test-renderer";
import { describe, expect, it, vi } from "vitest";

import { building } from "@/data/projects/linden-court/building";

import { BuildingScene } from "./building-scene";

vi.mock("../camera/camera-rig", () => ({ CameraRig: () => null }));
// The environment bakes a cube map with a real WebGL renderer; covered by e2e.
vi.mock("../studio-environment", () => ({ StudioEnvironment: () => null }));

describe("BuildingScene", () => {
  it("composes lights, ground and the building shell", async () => {
    const renderer = await ReactThreeTestRenderer.create(<BuildingScene building={building} />);
    expect(renderer.scene.findByType("DirectionalLight").props.castShadow).toBe(true);
    expect(renderer.scene.findByProps({ name: "building-shell" })).toBeDefined();
  });
});
