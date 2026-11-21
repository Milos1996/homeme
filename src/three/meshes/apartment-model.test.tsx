import ReactThreeTestRenderer from "@react-three/test-renderer";
import { describe, expect, it } from "vitest";

import { typeA } from "@/data/projects/linden-court/floor-plans/type-a";

import { ApartmentModel } from "./apartment-model";

describe("ApartmentModel", () => {
  it("renders one merged wall mesh and one floor slab per room", async () => {
    const renderer = await ReactThreeTestRenderer.create(<ApartmentModel plan={typeA} />);
    const meshes = renderer.scene.findAllByType("Mesh");

    expect(meshes.filter((m) => m.props.name === "walls")).toHaveLength(1);
    expect(meshes.filter((m) => String(m.props.name).startsWith("floor-"))).toHaveLength(
      typeA.rooms.length,
    );
  });

  it("builds geometry once per plan across re-renders", async () => {
    const renderer = await ReactThreeTestRenderer.create(<ApartmentModel plan={typeA} />);
    const before = renderer.scene.findByProps({ name: "walls" }).props.geometry as unknown;

    await renderer.update(<ApartmentModel plan={typeA} highlightedRoomId="living" />);
    const after = renderer.scene.findByProps({ name: "walls" }).props.geometry as unknown;

    expect(after).toBe(before);
  });
});
