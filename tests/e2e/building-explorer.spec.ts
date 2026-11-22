import { expect, test } from "@playwright/test";

test.describe("building explorer floors", () => {
  test("selects a floor from the list, shares it in the URL and restores it", async ({ page }) => {
    await page.goto("/projects/linden-court");
    const viewer = page.getByTestId("building-viewer-3d");
    await expect(viewer.locator("canvas")).toBeVisible({ timeout: 15_000 });

    await page.getByTestId("floor-button-3").click();
    await expect(page.getByTestId("floor-button-3")).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/\?floor=3$/);

    await page.goto("/projects/linden-court?floor=5");
    await expect(page.getByTestId("floor-button-5")).toHaveAttribute("aria-pressed", "true");
  });

  test("hovering a floor in the list shows its tooltip on the 3D building", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Hover is a pointer interaction");
    await page.goto("/projects/linden-court");
    const viewer = page.getByTestId("building-viewer-3d");
    await expect(viewer.locator("canvas")).toBeVisible({ timeout: 15_000 });

    await page.getByTestId("floor-button-2").hover();
    const tooltip = viewer.locator('[data-floor-tooltip="linden-court-l2"]');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("Floor 2");
    await expect(tooltip).toContainText("available");
  });
});

test.describe("apartment panel", () => {
  test("lists the selected floor's apartments and filters them", async ({ page }) => {
    await page.goto("/projects/linden-court");
    await expect(page.getByText("Choose a floor")).toBeVisible();

    await page.getByTestId("floor-button-3").click();
    const panel = page.getByTestId("apartment-panel");
    await expect(panel.getByRole("heading", { name: "Floor 3" })).toBeVisible();
    await expect(panel.getByRole("listitem")).toHaveCount(13);
    await expect(panel).toContainText("estimated area");

    await panel.getByRole("button", { name: "Sold" }).click();
    const soldCount = await panel.locator('[data-availability="sold"]').count();
    await expect(panel.getByRole("listitem")).toHaveCount(soldCount || 0);
    if (soldCount === 0) await expect(panel).toContainText("No apartments match these filters.");

    await panel.getByRole("button", { name: "Clear filters" }).first().click();
    await expect(panel.getByRole("listitem")).toHaveCount(13);
  });
});
