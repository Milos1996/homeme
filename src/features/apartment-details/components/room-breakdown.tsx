import { polygonArea, polygonBounds } from "@/domain/geometry";
import { isFullyVerified } from "@/domain/selectors";
import type { FloorPlan, Provenance } from "@/domain/types";
import { formatArea, formatLength } from "@/lib/format";

const isRect = (polygon: FloorPlan["rooms"][number]["polygon"]) =>
  polygon.length === 4 &&
  polygon.every((p, i) => {
    const q = polygon[(i + 1) % 4]!;
    return p.x === q.x || p.y === q.y;
  });

/** Room-by-room areas and sizes derived from the floor plan, with their provenance. */
export function RoomBreakdown({ plan }: { plan: FloorPlan }) {
  const provenance: Provenance = isFullyVerified(plan) ? "verified" : "estimated";
  const rooms = plan.rooms.map((room) => {
    const b = polygonBounds(room.polygon)!;
    const area = polygonArea(room.polygon);
    return {
      id: room.id,
      name: room.name,
      area,
      size: isRect(room.polygon)
        ? `${formatLength({ value: b.width, unit: "m", provenance })} × ${formatLength({ value: b.height, unit: "m", provenance })}`
        : "—",
    };
  });
  const total = rooms.reduce((sum, r) => sum + r.area, 0);

  return (
    <section aria-labelledby="rooms-heading">
      <h2 id="rooms-heading" className="text-3xl">
        Rooms
      </h2>
      <table className="mt-6 w-full text-left">
        <caption className="sr-only">Room areas and sizes</caption>
        <thead>
          <tr className="border-b border-border text-sm text-muted-foreground">
            <th scope="col" className="py-3 font-normal">
              Room
            </th>
            <th scope="col" className="py-3 font-normal">
              Size
            </th>
            <th scope="col" className="py-3 text-right font-normal">
              Area
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rooms.map((room) => (
            <tr key={room.id}>
              <th scope="row" className="py-3 font-medium">
                {room.name}
              </th>
              <td className="py-3 text-muted-foreground">{room.size}</td>
              <td className="py-3 text-right">
                {formatArea({ value: room.area, unit: "m2", provenance })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-foreground/20">
            <th scope="row" className="py-3 font-medium">
              Total
            </th>
            <td />
            <td className="py-3 text-right font-medium">
              {formatArea({ value: total, unit: "m2", provenance })}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
