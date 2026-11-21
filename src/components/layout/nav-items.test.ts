import { describe, expect, it } from "vitest";

import { isNavItemActive, NAV_ITEMS } from "./nav-items";

const [home, explore, about] = NAV_ITEMS as [
  (typeof NAV_ITEMS)[number],
  (typeof NAV_ITEMS)[number],
  (typeof NAV_ITEMS)[number],
];

describe("isNavItemActive", () => {
  it("matches Home only on the root path", () => {
    expect(isNavItemActive(home, "/")).toBe(true);
    expect(isNavItemActive(home, "/projects/linden-court")).toBe(false);
  });

  it("marks Explore building as current anywhere under /projects/", () => {
    expect(isNavItemActive(explore, "/projects/linden-court")).toBe(true);
    expect(isNavItemActive(explore, "/projects/linden-court/apartments/lc-0-01")).toBe(true);
    expect(isNavItemActive(explore, "/")).toBe(false);
  });

  it("never marks anchor links as current", () => {
    expect(isNavItemActive(about, "/")).toBe(false);
  });
});
