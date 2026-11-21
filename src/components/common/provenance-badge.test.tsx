import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProvenanceBadge } from "./provenance-badge";

describe("ProvenanceBadge", () => {
  it("labels estimates as estimated, never as verified", () => {
    render(<ProvenanceBadge provenance="estimated" />);

    const badge = screen.getByText("Estimated");
    expect(badge).toHaveAttribute("data-provenance", "estimated");
    expect(badge).toHaveAttribute("title", "Approximate value, not yet verified");
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
  });

  it("labels verified figures with their source description", async () => {
    render(<ProvenanceBadge provenance="verified" />);

    const badge = screen.getByText("Verified");
    await userEvent.hover(badge);
    expect(badge).toHaveAttribute("title", "Taken from dimensioned plans");
  });
});
