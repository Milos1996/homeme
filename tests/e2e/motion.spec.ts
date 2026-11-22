import { expect, test, type Page } from "@playwright/test";

const transitionStyle = (page: Page) =>
  page.locator("[data-page-transition]").evaluate((el) => {
    const s = getComputedStyle(el);
    return { opacity: s.opacity, transform: s.transform };
  });

test.describe("motion", () => {
  test("pages settle fully visible with no leftover transform", async ({ page }) => {
    await page.goto("/");
    // Settled = fully opaque with no meaningful offset (headless can stall the last frame).
    await expect
      .poll(
        async () => {
          const { opacity, transform } = await transitionStyle(page);
          const offsetY =
            transform === "none" ? 0 : Number(transform.split(",")[5]?.replace(")", ""));
          return Number(opacity) >= 0.99 && Math.abs(offsetY) < 0.5;
        },
        { timeout: 10_000 },
      )
      .toBe(true);
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
    const panel = page.getByTestId("apartment-panel");
    // Let the list finish staggering in before clicking a row.
    await expect(panel.getByRole("listitem")).toHaveCount(13);
    await panel.getByRole("link").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Apartment", {
      timeout: 15_000,
    });
    await page.waitForTimeout(600);

    expect(await cls()).toBeLessThan(0.1);
  });
});
