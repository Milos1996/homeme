import { expect, test } from "@playwright/test";

test.describe("site navigation", () => {
  test("header links reach the building explorer and back home", async ({ page, isMobile }) => {
    await page.goto("/");

    if (isMobile) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page
        .getByRole("navigation", { name: "Mobile" })
        .getByRole("link", { name: "Explore building" })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "Explore building" })
        .click();
    }

    await expect(page).toHaveURL(/\/projects\/linden-court$/);
    await expect(page.getByRole("heading", { level: 1, name: "Linden Court" })).toBeVisible();

    await page.getByRole("link", { name: /HomeMe home/ }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("footer states the development is fictional", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toContainText("fictional");
  });

  test("skip link moves focus to the main content", async ({ page, browserName, isMobile }) => {
    // Safari only tabs to links with Option+Tab by default, so check keyboard flow in Chromium.
    test.skip(isMobile || browserName === "webkit", "Desktop Chromium keyboard check");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#content$/);
  });
});
