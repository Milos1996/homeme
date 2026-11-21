import { expect, test } from "@playwright/test";

const APARTMENT = "/projects/linden-court/apartments/lc-0-01";

test.describe("3D apartment viewer", () => {
  test("loads the 3D model with room labels and switches camera presets", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(APARTMENT);
    const viewer = page.getByTestId("apartment-viewer-3d");
    await viewer.scrollIntoViewIfNeeded();

    await expect(viewer.locator("canvas")).toBeVisible({ timeout: 15_000 });
    await expect(viewer.locator("[data-room-label]")).toHaveCount(6);
    await expect(viewer.locator('[data-room-label="living"]')).toHaveText("Living room");

    const top = viewer.getByRole("radio", { name: "Top-down view" });
    await top.click();
    await expect(top).toHaveAttribute("aria-checked", "true");

    expect(errors, errors.join("\n")).toEqual([]);
  });
});

test.describe("2D/3D toggle", () => {
  test("switches to the 2D plan, unmounts the canvas and keeps the room selection", async ({
    page,
  }) => {
    await page.goto(APARTMENT);
    const viewer = page.getByRole("region", { name: /plan and 3D model/ });
    await expect(viewer.locator("canvas")).toBeVisible({ timeout: 15_000 });

    await viewer.getByRole("button", { name: /^Bedroom 2/ }).click();
    await expect(viewer.locator('[data-room-label="bedroom-2"]')).toHaveClass(/bg-forest-700/);

    await viewer.getByRole("radio", { name: "2D floor plan" }).click();
    await expect(viewer.locator("canvas")).toHaveCount(0);
    await expect(viewer.getByRole("img", { name: "Floor plan of apartment 0.01" })).toBeVisible();
    await expect(viewer.locator('[data-room="bedroom-2"]')).toHaveClass(/fill-sage-100/);

    await viewer.getByRole("radio", { name: "3D model" }).click();
    await expect(viewer.locator("canvas")).toBeVisible({ timeout: 15_000 });
  });
});
