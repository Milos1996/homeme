import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getProject } from "@/data";
import type { Apartment } from "@/domain/types";

import { apartmentMetadata } from "../metadata";
import { ApartmentDetails } from "./apartment-details";

vi.mock("@/features/apartment-viewer", () => ({
  ApartmentViewer: ({ apartmentNumber }: { apartmentNumber: string }) => (
    <div data-testid="viewer">viewer {apartmentNumber}</div>
  ),
}));

const project = getProject("linden-court")!;
const unit = (id: string) => project.apartments.find((a) => a.id === id)!;
const withPlan = unit("lc-0-01");
const withoutPlan = project.apartments.find((a) => !a.floorPlan && a.availability !== "sold")!;
const sold: Apartment = { ...withoutPlan, availability: "sold" };

describe("ApartmentDetails", () => {
  it("shows specs, the viewer, the room breakdown and the estimate legend for a unit with a plan", () => {
    render(<ApartmentDetails project={project} apartment={withPlan} />);

    expect(screen.getByRole("heading", { level: 1, name: "Apartment 0.01" })).toBeInTheDocument();
    expect(screen.getByText(/Fictional demo development/)).toBeInTheDocument();
    expect(screen.getByTestId("viewer")).toHaveTextContent("viewer 0.01");

    const specs = screen.getByTestId("apartment-specs");
    expect(within(specs).getByText("Available")).toBeInTheDocument();
    expect(within(specs).getByText("~63 m²")).toBeInTheDocument();
    expect(within(specs).getByText("Estimated")).toBeInTheDocument();
    expect(within(specs).getByText("3 rooms")).toBeInTheDocument();
    expect(within(specs).getByText("Raised ground floor")).toBeInTheDocument();
    expect(within(specs).getByRole("link", { name: "Ask about this home" })).toHaveAttribute(
      "href",
      "#inquiry",
    );

    const table = screen.getByRole("table", { name: "Room areas and sizes" });
    expect(within(table).getAllByRole("row")).toHaveLength(
      1 + withPlan.floorPlan!.rooms.length + 1,
    );
    expect(within(table).getByRole("rowheader", { name: "Total" }).parentElement).toHaveTextContent(
      "~63 m²",
    );
    expect(screen.getByTestId("provenance-legend")).toHaveTextContent("estimated figure");
    expect(screen.getByRole("form", { name: "Inquiry" })).toBeInTheDocument();
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
  });

  it("shows 'plan coming soon' and no room table when the unit has no layout", () => {
    render(<ApartmentDetails project={project} apartment={withoutPlan} />);
    expect(screen.getByTestId("plan-coming-soon")).toHaveTextContent("Floor plan coming soon");
    expect(screen.queryByTestId("viewer")).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows the price or 'Price on request', and neither price nor CTA once sold", () => {
    const { unmount } = render(<ApartmentDetails project={project} apartment={withoutPlan} />);
    expect(screen.getByTestId("apartment-price")).toHaveTextContent(
      withoutPlan.price ? "€" : "Price on request",
    );
    unmount();

    render(<ApartmentDetails project={project} apartment={sold} />);
    expect(screen.queryByTestId("apartment-price")).not.toBeInTheDocument();
    expect(screen.getByText("This home has been sold")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ask about this home" })).not.toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "Inquiry" })).not.toBeInTheDocument();
  });

  it("links back to the unit's floor", () => {
    render(<ApartmentDetails project={project} apartment={unit("lc-4-03")} />);
    expect(screen.getByRole("link", { name: "Back to Floor 4" })).toHaveAttribute(
      "href",
      "/projects/linden-court?floor=4",
    );
  });
});

describe("apartmentMetadata", () => {
  it("builds a per-unit title and description", () => {
    const meta = apartmentMetadata(project, withPlan);
    expect(meta.title).toBe("Apartment 0.01 · Linden Court");
    expect(meta.description).toBe(
      "3 rooms of ~63 m² on Raised ground floor at Linden Court. Available. Fictional demo development.",
    );
  });
});
