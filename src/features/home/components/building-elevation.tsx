import type { Building } from "@/domain/types";
import { cn } from "@/lib/utils";

interface BuildingElevationProps {
  building: Building;
  unitsPerFloor: number;
  className?: string;
}

const FLOOR_H = 30;
const WINDOW_W = 14;
const GAP = 8;
const PAD = 16;

/**
 * Decorative front elevation drawn from building data: one band per floor
 * (raised ground floor at the bottom) and a window per typical unit.
 * Pure SVG, rendered on the server.
 */
export function BuildingElevation({ building, unitsPerFloor, className }: BuildingElevationProps) {
  const floors = [...building.floors].sort((a, b) => b.level - a.level);
  const columns = Math.max(1, Math.round(unitsPerFloor / 2));
  const width = PAD * 2 + columns * WINDOW_W + (columns - 1) * GAP;
  const plinth = 14;
  const height = floors.length * FLOOR_H + plinth + 10;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Elevation of a building with ${floors.length} levels`}
      className={cn("h-auto w-full", className)}
    >
      <rect x={4} y={6} width={width - 8} height={4} rx={2} className="fill-stone-400" />
      {floors.map((floor, row) => {
        const y = 10 + row * FLOOR_H;
        return (
          <g key={floor.id}>
            <rect
              x={0}
              y={y}
              width={width}
              height={FLOOR_H}
              className="fill-paper stroke-stone-200"
            />
            {Array.from({ length: columns }, (_, col) => col)
              .filter((col) => !(row === floors.length - 1 && col === Math.floor(columns / 2)))
              .map((col) => (
                <rect
                  key={col}
                  x={PAD + col * (WINDOW_W + GAP)}
                  y={y + 7}
                  width={WINDOW_W}
                  height={FLOOR_H - 14}
                  rx={1.5}
                  className={cn(
                    (row + col) % 5 === 0 ? "fill-sage-300" : "fill-sage-100",
                    "stroke-stone-200",
                  )}
                />
              ))}
          </g>
        );
      })}
      <rect
        x={-8}
        y={10 + floors.length * FLOOR_H}
        width={width + 16}
        height={plinth}
        className="fill-stone-200"
      />
      <rect
        x={width / 2 - 10}
        y={10 + floors.length * FLOOR_H - 18}
        width={20}
        height={18}
        rx={2}
        className="fill-forest-700"
      />
    </svg>
  );
}
