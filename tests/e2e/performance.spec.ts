import { expect, test, type Page } from "@playwright/test";

/** Collects JS files loaded by a page and whether they contain three.js's renderer. */
async function scripts(page: Page, path: string) {
  const loaded: { url: string; three: boolean }[] = [];
  page.on("response", async (res) => {
    if (!res.url().endsWith(".js")) return;
    const body = await res.text().catch(() => "");
    loaded.push({ url: res.url(), three: body.includes("WebGLRenderer") });
  });
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  return loaded;
}

test.describe("bundle split", () => {
  test.skip(({ isMobile }) => isMobile, "Bundle contents don't depend on the viewport");

  test("the homepage loads no three.js code", async ({ page }) => {
    const js = await scripts(page, "/");
    expect(js.length).toBeGreaterThan(0);
    expect(js.filter((f) => f.three).map((f) => f.url)).toEqual([]);
  });

  test("3D routes load three.js in a separate chunk", async ({ page }) => {
    const js = await scripts(page, "/projects/linden-court");
    await expect(page.getByTestId("building-viewer-3d").locator("canvas")).toBeVisible({
      timeout: 15_000,
    });
    expect(js.some((f) => f.three)).toBe(true);
  });
});
