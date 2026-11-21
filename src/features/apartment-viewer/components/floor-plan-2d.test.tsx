import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { typeA } from "@/data/projects/linden-court/floor-plans/type-a";
import type { FloorPlan } from "@/domain/types";

import { FloorPlan2D } from "./floor-plan-2d";

const verifiedPlan = (plan: FloorPlan): FloorPlan => {
  const v = <T extends object>(d: T) => ({ ...d, provenance: "verified" as const });
  return {
    ...plan,
    walls: plan.walls.map((w) => ({ ...w, thickness: v(w.thickness), height: v(w.height) })),
    openings: plan.openings.map((o) => ({
      ...o,
      offset: v(o.offset),
      width: v(o.width),
      height: v(o.height),
      sillHeight: v(o.sillHeight),
    })),
  };
};

describe("FloorPlan2D", () => {
  it("is an accessible image that lists every room with its area for screen readers", () => {
    render(<FloorPlan2D plan={typeA} title="Floor plan of apartment 0.01" />);

    expect(screen.getByRole("img", { name: "Floor plan of apartment 0.01" })).toBeInTheDocument();
    const rooms = within(screen.getByRole("list", { name: "Rooms" })).getAllByRole("listitem");
    expect(rooms).toHaveLength(typeA.rooms.length);
    expect(rooms[0]).toHaveTextContent("Bathroom: ~8.2 m², ~2.40 m × ~3.40 m");
  });

  it("marks estimates with ~ and explains it in a legend", () => {
    const { container } = render(<FloorPlan2D plan={typeA} title="Plan" />);

    expect(screen.getByText(/Estimated dimensions/)).toBeInTheDocument();
    // Overall envelope: 9.275 m wide (−0.125 → 9.15), 7.275 m deep.
    const dims = [...container.querySelectorAll("[data-dimension] text")].map((t) => t.textContent);
    expect(dims).toEqual(["~9.28 m", "~7.28 m"]);
  });

  it("drops the ~ marker only when every dimension is verified", () => {
    const { container } = render(<FloorPlan2D plan={verifiedPlan(typeA)} title="Plan" />);

    expect(screen.getByText(/All dimensions verified/)).toBeInTheDocument();
    expect(container.textContent).not.toContain("~");
  });

  it("draws a swing for every door, glazing for every window, and leaves gaps in the walls", () => {
    const { container } = render(<FloorPlan2D plan={typeA} title="Plan" />);
    const count = (kind: string) => typeA.openings.filter((o) => o.kind === kind).length;

    expect(container.querySelectorAll('[data-opening="door"] path')).toHaveLength(count("door"));
    expect(container.querySelectorAll('[data-opening="window"]')).toHaveLength(count("window"));
  });

  it("highlights the selected room", () => {
    const { container } = render(
      <FloorPlan2D plan={typeA} title="Plan" highlightedRoomId="living" />,
    );
    expect(container.querySelector('[data-room="living"]')).toHaveClass("fill-sage-100");
    expect(container.querySelector('[data-room="kitchen"]')).toHaveClass("fill-paper");
  });
});
