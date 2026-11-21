import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CANVAS_TEST_ID } from "@/test/mock-r3f-canvas";

import SceneCanvas from "./scene-canvas";

vi.mock("@react-three/fiber", async () => (await import("@/test/mock-r3f-canvas")).r3fMock());

describe("SceneCanvas (jsdom, mocked Canvas)", () => {
  it("renders an accessible canvas placeholder without WebGL", () => {
    render(
      <SceneCanvas label="3D view of Linden Court">
        <mesh />
      </SceneCanvas>,
    );

    expect(screen.getByTestId(CANVAS_TEST_ID)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "3D view of Linden Court" })).toBeInTheDocument();
  });
});
