import { describe, expect, it } from "vitest";

import { buildingPose, cameraLimits, cameraPoses } from "./presets";

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

describe("buildingPose", () => {
  const wide = { minX: 0, minY: 0, maxX: 62, maxY: 16, width: 62, height: 16 };

  it("looks at the building's centre from a low three-quarter angle", () => {
    const { position, target } = buildingPose(wide, 25.2);
    expect(target).toEqual([31, expect.closeTo(10.08, 6) as number, 8]);
    const [x, y, z] = position;
    const horizontal = Math.hypot(x - 31, z - 8);
    // Low angle: more horizontal distance than height above the target.
    expect(horizontal).toBeGreaterThan(y - target[1]);
    expect(y).toBeGreaterThan(target[1]);
  });

  it("backs off further for wider buildings", () => {
    const narrow = { ...wide, maxX: 20, width: 20 };
    const d = (p: ReturnType<typeof buildingPose>) =>
      Math.hypot(p.position[0] - p.target[0], p.position[2] - p.target[2]);
    expect(d(buildingPose(wide, 25))).toBeGreaterThan(d(buildingPose(narrow, 25)));
  });
});

describe("buildingPose focus", () => {
  const wide = { minX: 0, minY: 0, maxX: 62, maxY: 16, width: 62, height: 16 };

  it("centres on a floor and moves closer", () => {
    const overview = buildingPose(wide, 25.2);
    const focused = buildingPose(wide, 25.2, { focusY: 11.7, zoom: 0.6 });
    expect(focused.target[1]).toBe(11.7);
    const dist = (p: typeof overview) =>
      Math.hypot(...(p.position.map((v, i) => v - p.target[i]!) as [number, number, number]));
    expect(dist(focused)).toBeCloseTo(dist(overview) * 0.6);
  });
});
