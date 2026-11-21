/**
 * Shared test util: jsdom has no WebGL, so replace R3F's <Canvas> with a
 * plain DOM element. Scene children are not rendered; test 3D composition
 * with @react-three/test-renderer instead.
 *
 * Usage (at the top of a test file):
 *   vi.mock("@react-three/fiber", async () => (await import("@/test/mock-r3f-canvas")).r3fMock());
 */
import type * as Fiber from "@react-three/fiber";
import type { ComponentProps } from "react";

export const CANVAS_TEST_ID = "r3f-canvas";

export function MockCanvas(props: ComponentProps<"div"> & Record<string, unknown>) {
  const label = typeof props["aria-label"] === "string" ? props["aria-label"] : undefined;
  return <div data-testid={CANVAS_TEST_ID} role="img" aria-label={label} />;
}

export async function r3fMock() {
  const { vi } = await import("vitest");
  const actual = await vi.importActual<typeof Fiber>("@react-three/fiber");
  return { ...actual, Canvas: MockCanvas };
}
