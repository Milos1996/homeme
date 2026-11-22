import { expect, test } from "@playwright/test";

test.describe("apartment detail page", () => {
  test("a unit with a layout shows specs, viewer, room breakdown and per-unit metadata", async ({
    page,
  }) => {
    await page.goto("/projects/linden-court/apartments/lc-0-01");
    await expect(page).toHaveTitle("Apartment 0.01 · Linden Court · HomeMe");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /3 rooms of ~63 m² on Raised ground floor/,
    );

    const specs = page.getByTestId("apartment-specs");
    await expect(specs).toContainText("Available");
    await expect(specs).toContainText("~63 m²");
    await expect(specs).toContainText("Estimated");
    await expect(page.getByRole("region", { name: /plan and 3D model/ })).toBeVisible();
    await expect(page.getByRole("table", { name: "Room areas and sizes" })).toBeVisible();
    await expect(page.getByTestId("provenance-legend")).toBeVisible();

    await specs.getByRole("link", { name: "Ask about this home" }).click();
    await expect(page).toHaveURL(/#inquiry$/);
  });

  test("a unit without a layout shows 'plan coming soon'", async ({ page }) => {
    await page.goto("/projects/linden-court/apartments/lc-3-02");
    await expect(page.getByTestId("plan-coming-soon")).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });
});

test.describe("inquiry form", () => {
  test("validates, then shows a success state without sending anything", async ({ page }) => {
    await page.goto("/projects/linden-court/apartments/lc-0-01");
    const sent: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") sent.push(`${r.method()} ${r.url()}`);
    });

    const form = page.getByRole("form", { name: "Inquiry" });
    await form.getByRole("button", { name: "Send inquiry" }).click();
    await expect(form.getByText("Please enter your name.")).toBeVisible();

    await form.getByLabel("Name").fill("Ana");
    await form.getByLabel("Email").fill("ana@example.com");
    await form.getByLabel("Message").fill("I'd like to arrange a viewing.");
    await form.getByRole("button", { name: "Send inquiry" }).click();

    await expect(page.getByTestId("inquiry-success")).toContainText("Thank you, Ana.");
    expect(sent).toEqual([]);
  });
});
