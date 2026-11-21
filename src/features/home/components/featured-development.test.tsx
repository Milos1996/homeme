import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getProject } from "@/data";

import { FeaturedDevelopment } from "./featured-development";

const project = getProject("linden-court")!;

describe("FeaturedDevelopment", () => {
  it("shows the key facts and labels the project as fictional", () => {
    render(<FeaturedDevelopment project={project} />);

    expect(screen.getByText("Fictional demo development")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Linden Court" })).toBeInTheDocument();
    expect(screen.getByText("Raised ground floor + 7 floors")).toBeInTheDocument();
    expect(screen.getByText("~104 homes, ~13 per floor")).toBeInTheDocument();
    expect(screen.getByText(project.setting)).toBeInTheDocument();
  });

  it("marks the estimated floor height as estimated", () => {
    render(<FeaturedDevelopment project={project} />);

    const height = screen.getByText("Floor-to-floor height").parentElement!;
    expect(within(height).getByText("~3.00 m")).toBeInTheDocument();
    expect(within(height).getByText("Estimated")).toBeInTheDocument();
    expect(within(height).queryByText("Verified")).not.toBeInTheDocument();
  });
});
