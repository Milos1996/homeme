import { Building2, DoorOpen, Layers, Ruler } from "lucide-react";

import { AvailabilityBadge } from "@/components/common/availability-badge";
import { ProvenanceBadge } from "@/components/common/provenance-badge";
import { Button } from "@/components/ui/button";
import type { Apartment, Floor } from "@/domain/types";
import { formatArea, formatPrice, formatRooms } from "@/lib/format";

interface ApartmentSpecsProps {
  apartment: Apartment;
  floor: Floor | undefined;
  projectName: string;
}

/** Key facts, price and the inquiry call to action. */
export function ApartmentSpecs({ apartment, floor, projectName }: ApartmentSpecsProps) {
  const facts = [
    {
      icon: Ruler,
      label: "Area",
      value: formatArea(apartment.area),
      provenance: apartment.area.provenance,
    },
    { icon: DoorOpen, label: "Rooms", value: formatRooms(apartment.roomCount) },
    { icon: Layers, label: "Floor", value: floor?.label ?? "—" },
    { icon: Building2, label: "Development", value: projectName },
  ];

  // Sold homes never show a price, even if one is still in the data.
  const price =
    apartment.availability === "sold"
      ? null
      : apartment.price
        ? formatPrice(apartment.price)
        : "Price on request";

  return (
    <aside
      aria-labelledby="specs-heading"
      className="rounded-3xl bg-card p-6 shadow-raised sm:p-8"
      data-testid="apartment-specs"
    >
      <h2 id="specs-heading" className="sr-only">
        Key facts
      </h2>
      <div className="flex items-center justify-between gap-4">
        <AvailabilityBadge availability={apartment.availability} className="text-sm" />
        <span className="text-sm text-muted-foreground">Unit {apartment.number}</span>
      </div>

      {price && (
        <p className="mt-6 font-display text-4xl tracking-tight" data-testid="apartment-price">
          {price}
        </p>
      )}
      {apartment.availability === "sold" && (
        <p className="mt-6 font-display text-2xl text-muted-foreground">This home has been sold</p>
      )}

      <dl className="mt-6 divide-y divide-border">
        {facts.map(({ icon: Icon, label, value, provenance }) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3">
            <dt className="flex items-center gap-3 text-sm text-muted-foreground">
              <Icon aria-hidden className="size-4" />
              {label}
            </dt>
            <dd className="flex items-center gap-2 text-right font-medium">
              {value}
              {provenance && <ProvenanceBadge provenance={provenance} />}
            </dd>
          </div>
        ))}
      </dl>

      {apartment.availability !== "sold" && (
        <Button asChild size="lg" className="mt-6 w-full rounded-full">
          <a href="#inquiry">Ask about this home</a>
        </Button>
      )}
    </aside>
  );
}
