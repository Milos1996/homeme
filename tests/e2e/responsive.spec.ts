import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/projects/linden-court?floor=3",
  "/projects/linden-court/apartments/lc-0-01",
  "/projects/linden-court/apartments/lc-3-02",
];

test.describe("responsive layout", () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
    "Viewport sweep runs once, in desktop Chromium",
  );

  for (const width of [1440, 1024, 768, 390]) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PAGES) {
        // Layout check only: no need to wait for the 3D chunk to finish loading.
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(300);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${path} overflows at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("tablet: floor list and apartment panel sit below the canvas without overlapping it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/projects/linden-court?floor=3");
    const canvas = (await page.getByTestId("building-viewer-3d").boundingBox())!;
    const floors = (await page.getByRole("navigation", { name: "Floors" }).boundingBox())!;
    const panel = (await page.getByTestId("apartment-panel").boundingBox())!;
    expect(floors.y).toBeGreaterThanOrEqual(canvas.y + canvas.height);
    expect(panel.y).toBeGreaterThanOrEqual(floors.y + floors.height);
  });
});

test.describe("touch devices", () => {
  test.skip(({ isMobile }) => !isMobile, "Touch-only checks");

  test("controls are at least 44 × 44 px", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const small = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            "main button, main a, main input, main textarea, header button, header a, footer a",
          ),
        ]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            if (el.closest("p")) return false; // links inside running text are exempt
            return r.width < 44 || r.height < 44;
          })
          .map((el) => `${el.tagName} "${(el.textContent ?? "").trim().slice(0, 20)}"`),
      );
      expect(small, `${path}: ${small.join(", ")}`).toEqual([]);
    }
  });

  test("3D canvases capture touch gestures for orbit and pinch zoom", async ({ page }) => {
    await page.goto("/projects/linden-court/apartments/lc-0-01");
    const canvas = page.getByTestId("apartment-viewer-3d").locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 15_000 });
    // R3F listens on the canvas wrapper; it must claim touch gestures so drags orbit and pinches zoom.
    const touchAction = await canvas.evaluate(
      (el) => getComputedStyle(el.parentElement!.parentElement!).touchAction,
    );
    expect(touchAction).toBe("none");
  });
});
