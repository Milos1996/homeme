import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { typeA } from "@/data/projects/linden-court/floor-plans/type-a";

import { useViewerStore } from "../store";
import { ApartmentViewer } from "./apartment-viewer";

vi.mock("@/three", () => ({
  useWebGLSupport: () => true,
  SceneLoading: () => null,
  LazyApartmentCanvas: ({
    label,
    highlightedRoomId,
    onRoomSelect,
  }: {
    label: string;
    highlightedRoomId: string | null;
    onRoomSelect?: (id: string) => void;
  }) => (
    <div role="img" aria-label={label} data-highlighted={highlightedRoomId ?? ""}>
      <button type="button" onClick={() => onRoomSelect?.("kitchen")}>
        Click kitchen floor in 3D
      </button>
    </div>
  ),
}));

const scene3d = () => screen.queryByRole("img", { name: "3D model of apartment 0.01" });
const plan2d = () => screen.queryByRole("img", { name: "Floor plan of apartment 0.01" });
const chip = (name: RegExp) => screen.getByRole("button", { name });

describe("ApartmentViewer", () => {
  beforeEach(() => useViewerStore.getState().reset());

  it("switches between 3D and 2D and unmounts the 3D canvas in 2D", async () => {
    const user = userEvent.setup();
    render(<ApartmentViewer plan={typeA} apartmentNumber="0.01" />);

    expect(scene3d()).toBeInTheDocument();
    expect(plan2d()).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "2D floor plan" }));
    expect(scene3d()).not.toBeInTheDocument();
    expect(plan2d()).toBeInTheDocument();
  });

  it("keeps a room selected from the list highlighted in both views", async () => {
    const user = userEvent.setup();
    const { container } = render(<ApartmentViewer plan={typeA} apartmentNumber="0.01" />);

    await user.click(chip(/^Living room/));
    expect(chip(/^Living room/)).toHaveAttribute("aria-pressed", "true");
    expect(scene3d()).toHaveAttribute("data-highlighted", "living");

    await user.click(screen.getByRole("radio", { name: "2D floor plan" }));
    expect(container.querySelector('[data-room="living"]')).toHaveClass("fill-sage-100");
  });

  it("syncs selections made in the 3D scene and in the 2D plan", async () => {
    const user = userEvent.setup();
    const { container } = render(<ApartmentViewer plan={typeA} apartmentNumber="0.01" />);

    await user.click(screen.getByRole("button", { name: "Click kitchen floor in 3D" }));
    expect(chip(/^Kitchen/)).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("radio", { name: "2D floor plan" }));
    await user.click(container.querySelector('[data-room="bathroom"]')!);
    expect(chip(/^Bathroom/)).toHaveAttribute("aria-pressed", "true");
    expect(chip(/^Kitchen/)).toHaveAttribute("aria-pressed", "false");
  });

  it("works with the keyboard", async () => {
    const user = userEvent.setup();
    render(<ApartmentViewer plan={typeA} apartmentNumber="0.01" />);

    await user.tab(); // focus the active "3D model" item
    expect(screen.getByRole("radio", { name: "3D model" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "2D floor plan" })).toHaveFocus();
    await user.keyboard(" ");
    expect(plan2d()).toBeInTheDocument();
  });

  it("shows room areas as estimates", () => {
    render(<ApartmentViewer plan={typeA} apartmentNumber="0.01" />);
    expect(chip(/^Bathroom/)).toHaveTextContent("Bathroom~8.2 m²");
  });
});
