import { useId } from "react";

import {
  floorPlanPrisms,
  layoutOpenings,
  polygonArea,
  polygonBounds,
  polygonCentroid,
} from "@/domain/geometry";
import { isFullyVerified } from "@/domain/selectors";
import type { FloorPlan, Point2, Polygon, Provenance } from "@/domain/types";
import { formatArea, formatLength } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FloorPlan2DProps {
  plan: FloorPlan;
  /** Accessible name, e.g. "Floor plan of apartment 0.01". */
  title: string;
  highlightedRoomId?: string | null;
  className?: string;
}

const MARGIN = 1.1; // metres around the envelope, room for dimension lines
const DIM_OFFSET = 0.55;

const points = (polygon: Polygon) => polygon.map((p) => `${p.x},${p.y}`).join(" ");
const isRect = (polygon: Polygon) =>
  polygon.length === 4 &&
  polygon.every((p, i) => {
    const q = polygon[(i + 1) % 4]!;
    return p.x === q.x || p.y === q.y;
  });

/**
 * 2D floor plan rendered as SVG from the same data as the 3D viewer.
 * Walls are drawn from the shared wall prisms (so joins and openings match
 * the 3D model), with door swings, window glazing, room labels and overall
 * dimensions. Every derived figure carries the plan's provenance: unless
 * the whole plan is verified, figures are marked as estimates with "~".
 */
export function FloorPlan2D({
  plan,
  title,
  highlightedRoomId = null,
  className,
}: FloorPlan2DProps) {
  const titleId = useId();
  const prisms = floorPlanPrisms(plan).filter((p) => p.kind === "wall");
  const openings = layoutOpenings(plan);
  const bounds = polygonBounds(
    ...prisms.map((p) => p.footprint),
    ...plan.rooms.map((r) => r.polygon),
  );
  if (!bounds) return null;

  const provenance: Provenance = isFullyVerified(plan) ? "verified" : "estimated";
  const len = (value: number) => formatLength({ value, unit: "m", provenance });
  const area = (value: number) => formatArea({ value, unit: "m2", provenance });

  const viewBox = [
    bounds.minX - MARGIN,
    bounds.minY - MARGIN,
    bounds.width + MARGIN * 2,
    bounds.height + MARGIN * 2,
  ].join(" ");

  const rooms = plan.rooms.map((room) => {
    const b = polygonBounds(room.polygon)!;
    return {
      ...room,
      center: polygonCentroid(room.polygon),
      area: area(polygonArea(room.polygon)),
      size: isRect(room.polygon) ? `${len(b.width)} × ${len(b.height)}` : null,
    };
  });

  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby={titleId}
        className="h-auto w-full font-sans"
      >
        <title id={titleId}>{title}</title>

        <g aria-hidden>
          {rooms.map((room) => (
            <polygon
              key={room.id}
              data-room={room.id}
              points={points(room.polygon)}
              className={cn(
                "transition-colors duration-200",
                room.id === highlightedRoomId ? "fill-sage-100" : "fill-paper",
              )}
            />
          ))}

          {prisms.map((p, i) => (
            <polygon key={i} points={points(p.footprint)} className="fill-charcoal" />
          ))}

          {openings.map((o) =>
            o.kind === "window" ? (
              <Window
                key={o.id}
                start={o.start}
                end={o.end}
                normal={o.normal}
                half={o.halfThickness}
              />
            ) : (
              <DoorSwing key={o.id} {...o} />
            ),
          )}

          <Dimension
            from={{ x: bounds.minX, y: bounds.minY - DIM_OFFSET }}
            to={{ x: bounds.maxX, y: bounds.minY - DIM_OFFSET }}
            label={len(bounds.width)}
          />
          <Dimension
            from={{ x: bounds.minX - DIM_OFFSET, y: bounds.maxY }}
            to={{ x: bounds.minX - DIM_OFFSET, y: bounds.minY }}
            label={len(bounds.height)}
            vertical
          />

          {rooms.map((room) => (
            <text
              key={room.id}
              x={room.center.x}
              y={room.center.y}
              textAnchor="middle"
              className="fill-foreground"
            >
              <tspan x={room.center.x} dy="-0.12" fontSize="0.26" fontWeight={500}>
                {room.name}
              </tspan>
              <tspan x={room.center.x} dy="0.32" fontSize="0.21" className="fill-muted-foreground">
                {room.area}
              </tspan>
              {room.size && (
                <tspan
                  x={room.center.x}
                  dy="0.28"
                  fontSize="0.18"
                  className="fill-muted-foreground"
                >
                  {room.size}
                </tspan>
              )}
            </text>
          ))}
        </g>
      </svg>

      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {provenance === "estimated" ? (
          <span>
            <span className="font-medium text-provenance-estimated">~</span> Estimated dimensions.
            Figures will be verified against the developer&apos;s unit plans.
          </span>
        ) : (
          <span>All dimensions verified against the developer&apos;s unit plans.</span>
        )}
      </figcaption>

      <ul className="sr-only" aria-label="Rooms">
        {rooms.map((room) => (
          <li key={room.id}>
            {room.name}: {room.area}
            {room.size ? `, ${room.size}` : ""}
          </li>
        ))}
      </ul>
    </figure>
  );
}

function Window({
  start,
  end,
  normal,
  half,
}: {
  start: Point2;
  end: Point2;
  normal: Point2;
  half: number;
}) {
  const offset = (p: Point2, k: number) => ({ x: p.x + normal.x * k, y: p.y + normal.y * k });
  return (
    <g data-opening="window" className="stroke-forest-600">
      <polygon
        points={points([
          offset(start, half),
          offset(end, half),
          offset(end, -half),
          offset(start, -half),
        ])}
        className="fill-paper"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

function DoorSwing({
  start,
  end,
  normal,
  halfThickness,
  swing,
}: {
  start: Point2;
  end: Point2;
  normal: Point2;
  halfThickness: number;
  swing: 1 | -1;
}) {
  const k = swing * halfThickness;
  const hinge = { x: start.x + normal.x * k, y: start.y + normal.y * k };
  const closed = { x: end.x + normal.x * k, y: end.y + normal.y * k };
  const width = Math.hypot(end.x - start.x, end.y - start.y);
  const open = { x: hinge.x + normal.x * swing * width, y: hinge.y + normal.y * swing * width };
  // Sweep direction depends on which way the leaf turns relative to the wall.
  const sweep =
    (closed.x - hinge.x) * (open.y - hinge.y) - (closed.y - hinge.y) * (open.x - hinge.x) > 0
      ? 1
      : 0;

  return (
    <g data-opening="door" className="fill-none stroke-stone-400">
      <line
        x1={hinge.x}
        y1={hinge.y}
        x2={open.x}
        y2={open.y}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M ${open.x} ${open.y} A ${width} ${width} 0 0 ${sweep} ${closed.x} ${closed.y}`}
        strokeWidth={1}
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

function Dimension({
  from,
  to,
  label,
  vertical = false,
}: {
  from: Point2;
  to: Point2;
  label: string;
  vertical?: boolean;
}) {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const tick = 0.12;
  const ticks = [from, to].map((p, i) =>
    vertical ? (
      <line
        key={i}
        x1={p.x - tick}
        y1={p.y}
        x2={p.x + tick}
        y2={p.y}
        vectorEffect="non-scaling-stroke"
      />
    ) : (
      <line
        key={i}
        x1={p.x}
        y1={p.y - tick}
        x2={p.x}
        y2={p.y + tick}
        vectorEffect="non-scaling-stroke"
      />
    ),
  );

  return (
    <g
      data-dimension
      className="stroke-stone-400"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
    >
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} vectorEffect="non-scaling-stroke" />
      {ticks}
      <text
        x={mid.x}
        y={mid.y}
        dy={vertical ? 0 : -0.14}
        textAnchor="middle"
        fontSize="0.22"
        stroke="none"
        className="fill-muted-foreground"
        transform={vertical ? `rotate(-90 ${mid.x} ${mid.y}) translate(0 -0.14)` : undefined}
      >
        {label}
      </text>
    </g>
  );
}
