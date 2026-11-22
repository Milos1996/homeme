import ReactThreeTestRenderer from "@react-three/test-renderer";
import { InstancedMesh, Matrix4, Vector3 } from "three";
import { describe, expect, it, vi } from "vitest";

import { building } from "@/data/projects/linden-court/building";

import { scenePalette } from "../palette";
import { BuildingShell } from "./building-shell";
import { buildingLayout, STOREY } from "../geometry/building-layout";

describe("buildingLayout", () => {
  it("stacks floors from the raised ground floor at the storey height", () => {
    const layout = buildingLayout(building);
    expect(layout.floors).toHaveLength(8);
    layout.floors.forEach((f, level) => expect(f.base).toBeCloseTo(1.2 + level * 3, 9));
    expect(layout.roof).toBeCloseTo(1.2 + 8 * 3);
  });

  it("orders floors by level even if the data isn't", () => {
    const shuffled = { ...building, floors: [...building.floors].reverse() };
    expect(buildingLayout(shuffled).floors.map((f) => f.level)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("handles a building without floors", () => {
    expect(buildingLayout({ ...building, floors: [] }).roof).toBe(1.2);
  });
});

describe("BuildingShell", () => {
  it("renders one addressable group per floor at the right height", async () => {
    const renderer = await ReactThreeTestRenderer.create(<BuildingShell building={building} />);

    for (const floor of building.floors) {
      const group = renderer.scene.findByProps({ name: floor.id });
      expect(group.instance.userData).toMatchObject({ floorId: floor.id, level: floor.level });
      expect(group.instance.position.y).toBeCloseTo(1.2 + floor.level * 3);
      // slab + facade + glazing band
      expect(group.children).toHaveLength(3);
    }
  });

  it("shares geometry between floors and instances the mullions", async () => {
    const renderer = await ReactThreeTestRenderer.create(<BuildingShell building={building} />);
    const slabs = building.floors.map(
      (f) =>
        (renderer.scene.findByProps({ name: f.id }).children[0]!.props as { geometry: unknown })
          .geometry,
    );
    expect(new Set(slabs).size).toBe(1);

    const mullions = renderer.scene.findByProps({ name: "mullions" }).instance as InstancedMesh;
    expect(mullions).toBeInstanceOf(InstancedMesh);
    expect(mullions.count % building.floors.length).toBe(0);

    // The first mullion sits in the ground floor's window band.
    const m = new Matrix4();
    mullions.getMatrixAt(0, m);
    const y = new Vector3().setFromMatrixPosition(m).y;
    expect(y).toBeCloseTo(1.2 + STOREY.slabThickness + STOREY.sill + STOREY.glazingHeight / 2);
  });
});

describe("BuildingShell interaction", () => {
  it("selects the floor whose facade is clicked and ignores decorative parts", async () => {
    const onFloorSelect = vi.fn();
    const renderer = await ReactThreeTestRenderer.create(
      <BuildingShell building={building} onFloorSelect={onFloorSelect} />,
    );
    // The test renderer doesn't bubble, so fire on the shell with the facade as the hit object.
    const shell = renderer.scene.findByProps({ name: "building-shell" });
    const facade = renderer.scene.findByProps({ name: "linden-court-l4" }).children[1]!;
    const stopPropagation = vi.fn();
    await renderer.fireEvent(shell, "click", { object: facade.instance, stopPropagation });
    expect(onFloorSelect).toHaveBeenCalledWith("linden-court-l4");
    expect(stopPropagation).toHaveBeenCalled();

    const plinth = renderer.scene.findByProps({ name: "plinth" });
    await renderer.fireEvent(shell, "click", { object: plinth.instance, stopPropagation });
    expect(onFloorSelect).toHaveBeenCalledTimes(1);
  });

  it("uses the hover and selected materials for those floors", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <BuildingShell
        building={building}
        hoveredFloorId="linden-court-l1"
        selectedFloorId="linden-court-l2"
      />,
    );
    const color = (id: string) =>
      (
        renderer.scene.findByProps({ name: id }).children[1]!.instance as unknown as {
          material: { color: { getHexString: () => string } };
        }
      ).material.color.getHexString();
    expect(color("linden-court-l1")).toBe(scenePalette.facadeHover.slice(1));
    expect(color("linden-court-l2")).toBe(scenePalette.facadeSelected.slice(1));
    expect(color("linden-court-l3")).toBe(scenePalette.facade.slice(1));
  });
});
