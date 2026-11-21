import { expect, test } from "@playwright/test";

test.describe("homepage smoke", () => {
  test("loads with hero and Explore in 3D CTA, without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("response", (res) => {
      if (res.status() >= 400) errors.push(`${res.status()} ${res.url()}`);
    });

    await page.goto("/");

    await expect(page).toHaveTitle(/HomeMe/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Find a place to call yours",
    );

    const cta = page.getByRole("link", { name: /explore in 3d/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /\/projects\/linden-court/);

    await expect(
      page
        .getByText(/fictional/i)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();

    expect(errors, `Console errors:\n${errors.join("\n")}`).toEqual([]);
  });
});
