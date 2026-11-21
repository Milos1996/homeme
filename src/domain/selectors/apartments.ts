import type { Apartment, Availability } from "../types";

export interface ApartmentFilter {
  readonly floorId?: string;
  readonly availability?: readonly Availability[];
  readonly roomCounts?: readonly number[];
}

/** Returns apartments matching every provided criterion. Empty or missing criteria match all. */
export function filterApartments(
  apartments: readonly Apartment[],
  filter: ApartmentFilter,
): Apartment[] {
  const { floorId, availability, roomCounts } = filter;
  return apartments.filter(
    (a) =>
      (floorId === undefined || a.floorId === floorId) &&
      (!availability?.length || availability.includes(a.availability)) &&
      (!roomCounts?.length || roomCounts.includes(a.roomCount)),
  );
}

/** Counts apartments per availability state. Every state is present, defaulting to 0. */
export function countByAvailability(
  apartments: readonly Apartment[],
): Record<Availability, number> {
  const counts: Record<Availability, number> = { available: 0, reserved: 0, sold: 0 };
  for (const a of apartments) counts[a.availability] += 1;
  return counts;
}
