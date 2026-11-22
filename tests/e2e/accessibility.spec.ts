import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/projects/linden-court",
  "/projects/linden-court?floor=3",
  "/projects/linden-court/apartments/lc-0-01",
  "/projects/linden-court/apartments/lc-3-02",
];

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  for (const path of PAGES) {
    test(`${path} has no detectable violations`, async ({ page }) => {
      // Reduced motion makes entrance animations instant, so contrast is measured on final colours.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      // Pages that restore a floor from the URL apply it after hydration; scan the settled state.
      const level = new URL(path, "http://x").searchParams.get("floor");
      if (level !== null) {
        await expect(page.getByTestId(`floor-button-${level}`)).toHaveAttribute(
          "aria-pressed",
          "true",
        );
      }
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      const summary = results.violations.map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help} — ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      );
      expect(summary, summary.join("\n")).toEqual([]);
    });
  }
});
