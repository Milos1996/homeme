import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { typeA } from "@/data/projects/linden-court/floor-plans/type-a";

import { ApartmentViewer3D } from "./apartment-viewer-3d";

function Controlled({ label }: { label: string }) {
  const [mode, setMode] = useState<"orbit" | "top">("orbit");
  return (
    <ApartmentViewer3D plan={typeA} label={label} cameraMode={mode} onCameraModeChange={setMode} />
  );
}

const webgl = vi.hoisted((): { supported: boolean | null } => ({ supported: true }));

vi.mock("@/three", () => ({
  useWebGLSupport: () => webgl.supported,
  SceneLoading: () => <div role="status">Preparing 3D view…</div>,
  LazyApartmentCanvas: ({ label, cameraMode }: { label: string; cameraMode: string }) => (
    <div role="img" aria-label={label} data-camera={cameraMode} />
  ),
}));

describe("ApartmentViewer3D", () => {
  beforeEach(() => {
    webgl.supported = true;
  });

  it("renders the scene and switches between orbit and top-down cameras", async () => {
    const user = userEvent.setup();
    render(<Controlled label="3D model of apartment 0.01" />);

    const scene = screen.getByRole("img", { name: "3D model of apartment 0.01" });
    expect(scene).toHaveAttribute("data-camera", "orbit");

    await user.click(screen.getByRole("radio", { name: "Top-down view" }));
    expect(scene).toHaveAttribute("data-camera", "top");

    // Clicking the active item again must not clear the selection.
    await user.click(screen.getByRole("radio", { name: "Top-down view" }));
    expect(scene).toHaveAttribute("data-camera", "top");
  });

  it("shows a fallback message when WebGL is unavailable", () => {
    webgl.supported = false;
    render(<Controlled label="3D model" />);

    expect(screen.getByText("3D view isn't available")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows the loading state before WebGL support is known", () => {
    webgl.supported = null;
    render(<Controlled label="3D model" />);
    expect(screen.getByRole("status")).toHaveTextContent("Preparing 3D view");
  });
});
