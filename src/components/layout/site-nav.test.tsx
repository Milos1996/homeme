import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteNav } from "./site-nav";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("SiteNav", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("renders the main links and marks the current page", () => {
    pathname.current = "/projects/linden-court";
    render(<SiteNav />);

    const main = screen.getByRole("navigation", { name: "Main" });
    expect(within(main).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(main).getByRole("link", { name: "Explore building" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(main).getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  });

  it("opens the mobile menu and closes it when a link is chosen", async () => {
    const user = userEvent.setup();
    render(<SiteNav />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = await screen.findByRole("dialog");
    const mobile = within(dialog).getByRole("navigation", { name: "Mobile" });

    await user.click(within(mobile).getByRole("link", { name: "Explore building" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
