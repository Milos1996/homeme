"use client";

import { cn } from "@/lib/utils";

import type { FloorSummary } from "../floor-summary";

interface FloorPickerProps {
  floors: readonly FloorSummary[];
  selectedFloorId: string | null;
  hoveredFloorId: string | null;
  onSelect: (floorId: string) => void;
  onHover: (floorId: string | null) => void;
}

/**
 * Floor list mirroring the 3D building (top floor first). It offers the
 * same hover and selection as the canvas to keyboard and screen reader users.
 */
export function FloorPicker({
  floors,
  selectedFloorId,
  hoveredFloorId,
  onSelect,
  onHover,
}: FloorPickerProps) {
  return (
    <nav aria-label="Floors">
      <ul className="flex flex-col gap-1">
        {floors.map((floor) => {
          const selected = floor.id === selectedFloorId;
          const hovered = floor.id === hoveredFloorId;
          return (
            <li key={floor.id}>
              <button
                type="button"
                data-testid={`floor-button-${floor.level}`}
                aria-pressed={selected}
                onClick={() => onSelect(floor.id)}
                onMouseEnter={() => onHover(floor.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(floor.id)}
                onBlur={() => onHover(null)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  selected
                    ? "bg-forest-700 text-warm-white"
                    : hovered
                      ? "bg-accent text-accent-foreground"
                      : "bg-paper text-foreground hover:bg-accent",
                )}
              >
                <span className="font-medium">{floor.label}</span>
                <span
                  className={cn(
                    "text-sm",
                    selected ? "text-warm-white/80" : "text-muted-foreground",
                  )}
                >
                  {floor.counts.available} of {floor.total} available
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
