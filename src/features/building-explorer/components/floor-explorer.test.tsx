import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getProject } from "@/data";

import { summarizeFloors, summarizeUnits } from "../floor-summary";
import { useExplorerStore } from "../store";
import { FloorExplorer } from "./floor-explorer";

vi.mock("@/three", () => ({
  useWebGLSupport: () => true,
  SceneLoading: () => null,
  LazyBuildingCanvas: (props: {
    label: string;
    hoveredFloorId: string | null;
    selectedFloorId: string | null;
    onFloorSelect: (id: string) => void;
    onFloorHover: (id: string | null) => void;
  }) => (
    <div
      role="img"
      aria-label={props.label}
      data-hovered={props.hoveredFloorId ?? ""}
      data-selected={props.selectedFloorId ?? ""}
    >
      <button type="button" onClick={() => props.onFloorSelect("linden-court-l6")}>
        click floor 6 in 3D
      </button>
      <button type="button" onMouseEnter={() => props.onFloorHover("linden-court-l2")}>
        hover floor 2 in 3D
      </button>
    </div>
  ),
}));

const project = getProject("linden-court")!;
const floors = summarizeFloors(project);
const units = summarizeUnits(project);
const renderExplorer = () =>
  render(
    <FloorExplorer
      projectSlug="linden-court"
      projectName="Linden Court"
      building={project.building}
      floors={floors}
      units={units}
    />,
  );
const scene = () => screen.getByRole("img", { name: /3D model of Linden Court/ });
const floorButton = (level: number) => screen.getByTestId(`floor-button-${level}`);

describe("FloorExplorer", () => {
  beforeEach(() => {
    useExplorerStore.getState().reset();
    window.history.replaceState(null, "", "/projects/linden-court");
  });

  it("selects a floor from the list, highlights it in 3D and writes ?floor=", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(floorButton(3));
    expect(floorButton(3)).toHaveAttribute("aria-pressed", "true");
    expect(scene()).toHaveAttribute("data-selected", "linden-court-l3");
    expect(window.location.search).toBe("?floor=3");

    await user.click(floorButton(3));
    expect(floorButton(3)).toHaveAttribute("aria-pressed", "false");
    expect(window.location.search).toBe("");
  });

  it("restores the selected floor from the URL", () => {
    window.history.replaceState(null, "", "/projects/linden-court?floor=5");
    renderExplorer();
    expect(floorButton(5)).toHaveAttribute("aria-pressed", "true");
  });

  it("ignores an unknown floor in the URL", () => {
    window.history.replaceState(null, "", "/projects/linden-court?floor=42");
    renderExplorer();
    expect(scene()).toHaveAttribute("data-selected", "");
  });

  it("syncs hover and selection made in the 3D scene", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.hover(screen.getByRole("button", { name: "hover floor 2 in 3D" }));
    expect(scene()).toHaveAttribute("data-hovered", "linden-court-l2");

    await user.click(screen.getByRole("button", { name: "click floor 6 in 3D" }));
    expect(floorButton(6)).toHaveAttribute("aria-pressed", "true");
  });

  it("highlights the 3D floor when a list item is hovered or focused", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.hover(floorButton(1));
    expect(scene()).toHaveAttribute("data-hovered", "linden-court-l1");
    await user.unhover(floorButton(1));
    expect(scene()).toHaveAttribute("data-hovered", "");

    act(() => floorButton(4).focus());
    expect(scene()).toHaveAttribute("data-hovered", "linden-court-l4");
  });

  it("shows availability for each floor", () => {
    renderExplorer();
    const ground = floors.at(-1)!;
    expect(floorButton(0)).toHaveTextContent(
      `Raised ground floor${ground.counts.available} of 10 available`,
    );
  });

  it("restores floor and filters from the URL and writes filter changes back", async () => {
    const user = userEvent.setup();
    window.history.replaceState(
      null,
      "",
      "/projects/linden-court?floor=3&status=available&rooms=2",
    );
    renderExplorer();

    expect(floorButton(3)).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Available" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "2 rooms" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Reserved" }));
    expect(window.location.search).toBe("?floor=3&status=available%2Creserved&rooms=2");

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(window.location.search).toBe("?floor=3");
  });

  it("links units to their apartment pages", async () => {
    const user = userEvent.setup();
    renderExplorer();
    await user.click(floorButton(2));
    expect(screen.getByRole("link", { name: /^2\.01/ })).toHaveAttribute(
      "href",
      "/projects/linden-court/apartments/lc-2-01",
    );
  });
});
