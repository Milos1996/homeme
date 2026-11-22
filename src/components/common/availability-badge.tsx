import { Badge } from "@/components/ui/badge";
import type { Availability } from "@/domain/types";
import { cn } from "@/lib/utils";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

const STYLE: Record<Availability, string> = {
  available: "border-status-available/30 bg-sage-100 text-status-available",
  reserved: "border-status-reserved/30 bg-provenance-estimated-bg text-status-reserved",
  sold: "border-stone-200 bg-stone-100 text-status-sold",
};

/** Availability state as a small, colour-coded pill (colour is never the only cue: it has text). */
export function AvailabilityBadge({
  availability,
  className,
}: {
  availability: Availability;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      data-availability={availability}
      className={cn("font-medium", STYLE[availability], className)}
    >
      {AVAILABILITY_LABEL[availability]}
    </Badge>
  );
}
