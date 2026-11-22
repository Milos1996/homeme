import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { building } from "@/data/projects/linden-court/building";

import { BuildingViewer3D } from "./building-viewer-3d";

const webgl = vi.hoisted((): { supported: boolean | null } => ({ supported: true }));

vi.mock("@/three", () => ({
  useWebGLSupport: () => webgl.supported,
  SceneLoading: () => <div role="status">Preparing 3D view…</div>,
  LazyBuildingCanvas: ({ label }: { label: string }) => <div role="img" aria-label={label} />,
}));

describe("BuildingViewer3D", () => {
  beforeEach(() => {
    webgl.supported = true;
  });

  it("renders the building scene", () => {
    render(<BuildingViewer3D building={building} label="3D model of Linden Court" />);
    expect(screen.getByRole("img", { name: "3D model of Linden Court" })).toBeInTheDocument();
  });

  it("falls back without WebGL and shows loading before support is known", () => {
    webgl.supported = false;
    const { rerender } = render(<BuildingViewer3D building={building} label="3D" />);
    expect(screen.getByText("3D view isn't available")).toBeInTheDocument();

    webgl.supported = null;
    rerender(<BuildingViewer3D building={building} label="3D" />);
    expect(screen.getByRole("status")).toHaveTextContent("Preparing 3D view");
  });
});
