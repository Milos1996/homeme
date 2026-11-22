import { expect, test } from "@playwright/test";

test.describe("explorer → apartment journey", () => {
  test("opens an apartment from the list and comes back to the same floor and filters", async ({
    page,
  }) => {
    await page.goto("/projects/linden-court");
    await page.getByTestId("floor-button-3").click();
    const panel = page.getByTestId("apartment-panel");
    await panel.getByRole("button", { name: "Available" }).click();
    await expect(page).toHaveURL(/\?floor=3&status=available$/);

    // Pick the first unit that is actually available (filtered-out rows may still be fading out).
    const first = panel
      .getByRole("listitem")
      .filter({ has: page.locator('[data-availability="available"]') })
      .first();
    const number = (await first.locator("span").first().textContent())!.trim();
    await first.getByRole("link").click();

    await expect(page).toHaveURL(/\/projects\/linden-court\/apartments\/lc-3-\d{2}$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Apartment ${number}`);

    await page.goBack();
    await expect(page).toHaveURL(/\?floor=3&status=available$/);
    await expect(page.getByTestId("floor-button-3")).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByTestId("apartment-panel").getByRole("button", { name: "Available" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("the apartment page links back to its floor", async ({ page }) => {
    await page.goto("/projects/linden-court/apartments/lc-5-02");
    await page.getByRole("link", { name: "Back to Floor 5" }).click();
    await expect(page).toHaveURL(/\/projects\/linden-court\?floor=5$/);
    await expect(page.getByTestId("floor-button-5")).toHaveAttribute("aria-pressed", "true");
  });

  test("an unknown apartment id renders the not-found page and is not indexable", async ({
    page,
  }) => {
    // With Cache Components the prerendered shell streams first (HTTP 200); Next.js then
    // streams the not-found UI with a noindex robots tag (Next.js docs: loading → Status codes).
    await page.goto("/projects/linden-court/apartments/lc-9-99");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "This place isn't on the map.",
    );
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  });
});
