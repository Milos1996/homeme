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
