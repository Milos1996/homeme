import { expect, test, type Page } from "@playwright/test";

const transitionStyle = (page: Page) =>
  page.locator("[data-page-transition]").evaluate((el) => {
    const s = getComputedStyle(el);
    return { opacity: s.opacity, transform: s.transform };
  });

test.describe("motion", () => {
  test("pages settle fully visible with no leftover transform", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => transitionStyle(page)).toEqual({ opacity: "1", transform: "none" });
  });

  test("respects prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects/linden-court");
    // The CSS rise-in is disabled for reduced-motion users, even before hydration.
    expect(await transitionStyle(page)).toEqual({ opacity: "1", transform: "none" });
  });

  test("navigating home → explorer → apartment causes no layout shift", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Measured on desktop");
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const cls = () => page.evaluate(() => (window as unknown as { __cls: number }).__cls);

    await page.goto("/");
    await page.getByRole("link", { name: /explore in 3d/i }).click();
    await expect(page.getByTestId("building-viewer-3d")).toBeVisible();
    await page.getByTestId("floor-button-2").click();
    await page.getByTestId("apartment-panel").getByRole("link").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Apartment");
    await page.waitForTimeout(600);

    expect(await cls()).toBeLessThan(0.1);
  });
});
