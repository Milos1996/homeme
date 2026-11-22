"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

import { AVAILABILITY_LABEL, AvailabilityBadge } from "@/components/common/availability-badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { filterApartments } from "@/domain/selectors";
import type { Availability } from "@/domain/types";
import { DEMO_NOTICE } from "@/lib/constants";
import { formatArea, formatPrice, formatRooms } from "@/lib/format";

import type { FloorSummary, UnitSummary } from "../floor-summary";

const AVAILABILITIES: Availability[] = ["available", "reserved", "sold"];

interface ApartmentPanelProps {
  floor: FloorSummary | null;
  units: readonly UnitSummary[];
  availabilityFilter: Availability[];
  roomFilter: number[];
  onAvailabilityFilterChange: (values: Availability[]) => void;
  onRoomFilterChange: (values: number[]) => void;
  onClearFilters: () => void;
  /** Link target for a unit's detail page. */
  unitHref: (unitId: string) => string;
}

/** Apartments on the selected floor, with availability and room-count filters. */
export function ApartmentPanel({
  floor,
  units,
  availabilityFilter,
  roomFilter,
  onAvailabilityFilterChange,
  onRoomFilterChange,
  onClearFilters,
  unitHref,
}: ApartmentPanelProps) {
  if (!floor) {
    return (
      <section aria-label="Apartments" className="rounded-3xl bg-paper p-8 text-center shadow-soft">
        <p className="font-display text-2xl">Choose a floor</p>
        <p className="mt-2 text-muted-foreground">
          Pick a level on the building or in the floor list to see its apartments.
        </p>
      </section>
    );
  }

  const onFloor = filterApartments(units, { floorId: floor.id });
  const roomOptions = [...new Set(onFloor.map((u) => u.roomCount))].sort((a, b) => a - b);
  const shown = filterApartments(onFloor, {
    availability: availabilityFilter,
    roomCounts: roomFilter,
  });
  const filtered = availabilityFilter.length > 0 || roomFilter.length > 0;

  return (
    <section
      aria-labelledby="apartments-heading"
      data-testid="apartment-panel"
      className="rounded-3xl bg-paper p-6 shadow-soft sm:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="apartments-heading" className="text-3xl">
          {floor.label}
        </h2>
        <p className="text-sm text-muted-foreground">{DEMO_NOTICE}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <ToggleGroup
          type="multiple"
          value={availabilityFilter}
          onValueChange={(v) => onAvailabilityFilterChange(v as Availability[])}
          aria-label="Filter by availability"
          variant="outline"
          className="flex-wrap"
        >
          {AVAILABILITIES.map((a) => (
            <ToggleGroupItem key={a} value={a} className="rounded-full px-3">
              {AVAILABILITY_LABEL[a]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="multiple"
          value={roomFilter.map(String)}
          onValueChange={(v) => onRoomFilterChange(v.map(Number))}
          aria-label="Filter by rooms"
          variant="outline"
          className="flex-wrap"
        >
          {roomOptions.map((rooms) => (
            <ToggleGroupItem key={rooms} value={String(rooms)} className="rounded-full px-3">
              {formatRooms(rooms)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {filtered && (
          <Button variant="link" size="sm" onClick={onClearFilters} className="px-0">
            Clear filters
          </Button>
        )}
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {shown.length} of {onFloor.length} apartments ·{" "}
        <span className="font-medium text-provenance-estimated">~</span> estimated area
      </p>

      {shown.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-medium">No apartments match these filters.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="mt-4 rounded-full"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <motion.ul
          key={floor.id}
          className="mt-4 divide-y divide-border"
          aria-label={`Apartments on ${floor.label}`}
          initial="hidden"
          animate="shown"
          variants={{ shown: { transition: { staggerChildren: 0.025 } } }}
        >
          <AnimatePresence initial={false}>
            {shown.map((unit) => (
              <motion.li
                key={unit.id}
                data-testid={`unit-${unit.number}`}
                variants={{ hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0 } }}
                initial="hidden"
                animate="shown"
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <Link
                  href={unitHref(unit.id)}
                  className="group -mx-3 grid grid-cols-[4rem_1fr_auto] items-center gap-x-4 gap-y-1 rounded-2xl px-3 py-4 transition-[background-color,transform] duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.99] motion-reduce:active:scale-100 sm:grid-cols-[5rem_8rem_1fr_auto_8rem_1.25rem]"
                >
                  <span className="font-display text-xl">{unit.number}</span>
                  <span className="text-sm text-muted-foreground sm:text-base sm:text-foreground">
                    {formatRooms(unit.roomCount)}
                  </span>
                  <span className="col-start-2 row-start-2 text-sm sm:col-start-auto sm:row-start-auto sm:text-base">
                    {formatArea(unit.area)}
                  </span>
                  <AvailabilityBadge
                    availability={unit.availability}
                    className="col-start-3 row-span-2 row-start-1 justify-self-end sm:col-start-auto sm:row-span-1 sm:row-start-auto"
                  />
                  <span className="col-span-3 text-sm text-muted-foreground sm:col-span-1 sm:text-right sm:text-base sm:text-foreground">
                    {unit.price
                      ? formatPrice(unit.price)
                      : unit.availability === "sold"
                        ? "—"
                        : "Price on request"}
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="hidden size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 sm:block"
                  />
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}
