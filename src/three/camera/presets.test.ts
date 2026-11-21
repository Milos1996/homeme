import { describe, expect, it } from "vitest";

import { cameraLimits, cameraPoses } from "./presets";

const bounds = { minX: 0, minY: 0, maxX: 9, maxY: 7, width: 9, height: 7 };

describe("camera presets", () => {
  it("centres both poses on the plan", () => {
    const { orbit, top } = cameraPoses(bounds, 2.7);
    expect(top.target).toEqual([4.5, 0, 3.5]);
    expect(orbit.target[0]).toBe(4.5);
    expect(orbit.target[2]).toBe(3.5);
  });

  it("looks straight down in top view, with north up", () => {
    const { top } = cameraPoses(bounds, 2.7);
    expect(top.position[0]).toBe(4.5);
    // Slightly south of the target so the screen's up direction is north (−z).
    expect(top.position[2]).toBeGreaterThan(3.5);
    expect(top.position[2] - 3.5).toBeLessThan(0.01);
    expect(top.position[1]).toBeGreaterThan(2.7);
  });

  it("keeps the orbit view above the walls and within the zoom limits", () => {
    const { orbit } = cameraPoses(bounds, 2.7);
    const limits = cameraLimits(bounds);
    const [x, y, z] = orbit.position;
    const [tx, ty, tz] = orbit.target;
    const distance = Math.hypot(x - tx, y - ty, z - tz);

    expect(y).toBeGreaterThan(2.7);
    expect(distance).toBeGreaterThan(limits.minDistance);
    expect(distance).toBeLessThan(limits.maxDistance);
    expect(limits.maxPolarAngle).toBeLessThan(Math.PI / 2);
  });
});
