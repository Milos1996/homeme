import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { getProject } from "@/data";
import type { Availability } from "@/domain/types";

import { summarizeFloors, summarizeUnits, type FloorSummary } from "../floor-summary";
import { ApartmentPanel } from "./apartment-panel";

const project = getProject("linden-court")!;
const floors = summarizeFloors(project);
const units = summarizeUnits(project);
const floor3 = floors.find((f) => f.level === 3)!;

function Panel({ floor }: { floor: FloorSummary | null }) {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [rooms, setRooms] = useState<number[]>([]);
  return (
    <ApartmentPanel
      floor={floor}
      units={units}
      availabilityFilter={availability}
      roomFilter={rooms}
      onAvailabilityFilterChange={setAvailability}
      onRoomFilterChange={setRooms}
      onClearFilters={() => {
        setAvailability([]);
        setRooms([]);
      }}
    />
  );
}

const rows = () =>
  within(screen.getByRole("list", { name: "Apartments on Floor 3" })).getAllByRole("listitem");

describe("ApartmentPanel", () => {
  it("asks for a floor before one is selected", () => {
    render(<Panel floor={null} />);
    expect(screen.getByText("Choose a floor")).toBeInTheDocument();
  });

  it("lists every unit on the floor with number, rooms, estimated area, availability and price", () => {
    render(<Panel floor={floor3} />);
    expect(rows()).toHaveLength(13);
    expect(screen.getByText("13 of 13 apartments ·", { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/Fictional demo development/)).toBeInTheDocument();

    const unit = units.find((u) => u.number === "3.01")!;
    const row = screen.getByTestId("unit-3.01");
    expect(row).toHaveTextContent("3.01");
    expect(row).toHaveTextContent("3 rooms");
    expect(row).toHaveTextContent(`~${unit.area.value} m²`);
    expect(row).toHaveTextContent(
      { available: "Available", reserved: "Reserved", sold: "Sold" }[unit.availability],
    );
  });

  it("never shows a price for sold units and says 'Price on request' when one is missing", () => {
    render(<Panel floor={floor3} />);
    for (const u of units.filter((u) => u.floorId === floor3.id)) {
      const row = screen.getByTestId(`unit-${u.number}`);
      if (u.availability === "sold") expect(row).toHaveTextContent("—");
      else if (!u.price) expect(row).toHaveTextContent("Price on request");
      else expect(row).toHaveTextContent("€");
    }
  });

  it("filters by availability and rooms", async () => {
    const user = userEvent.setup();
    render(<Panel floor={floor3} />);
    const onFloor = units.filter((u) => u.floorId === floor3.id);

    await user.click(screen.getByRole("button", { name: "Available" }));
    expect(rows()).toHaveLength(onFloor.filter((u) => u.availability === "available").length);

    await user.click(screen.getByRole("button", { name: "3 rooms" }));
    expect(rows()).toHaveLength(
      onFloor.filter((u) => u.availability === "available" && u.roomCount === 3).length,
    );
  });

  it("shows an empty state when nothing matches, and clears the filters", async () => {
    const user = userEvent.setup();
    const floor: FloorSummary = {
      id: "f",
      level: 1,
      label: "Floor 3",
      total: 2,
      counts: { available: 2, reserved: 0, sold: 0 },
    };
    const synthetic = units.slice(0, 2).map((u, i) => ({
      ...u,
      id: `u${i}`,
      number: `1.0${i}`,
      floorId: "f",
      availability: "available" as const,
    }));
    function SyntheticPanel() {
      const [availability, setAvailability] = useState<Availability[]>([]);
      return (
        <ApartmentPanel
          floor={floor}
          units={synthetic}
          availabilityFilter={availability}
          roomFilter={[]}
          onAvailabilityFilterChange={setAvailability}
          onRoomFilterChange={() => {}}
          onClearFilters={() => setAvailability([])}
        />
      );
    }
    render(<SyntheticPanel />);

    await user.click(screen.getByRole("button", { name: "Sold" }));
    expect(screen.getByText("No apartments match these filters.")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(rows()).toHaveLength(2);
  });

  it("only offers room filters that exist on the floor", () => {
    render(<Panel floor={floors.find((f) => f.level === 0)!} />);
    // The raised ground floor has no 4-room homes.
    expect(screen.queryByRole("button", { name: "4 rooms" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Studio" })).toBeInTheDocument();
  });
});
