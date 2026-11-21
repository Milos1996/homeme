import { BadgeCheck, Ruler } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Provenance } from "@/domain/types";
import { cn } from "@/lib/utils";

const COPY: Record<Provenance, { label: string; description: string }> = {
  verified: { label: "Verified", description: "Taken from dimensioned plans" },
  estimated: { label: "Estimated", description: "Approximate value, not yet verified" },
};

interface ProvenanceBadgeProps {
  provenance: Provenance;
  className?: string;
}

/**
 * Shows whether a figure is verified or estimated. Use it next to any
 * dimension the user sees; estimates must never look verified.
 */
export function ProvenanceBadge({ provenance, className }: ProvenanceBadgeProps) {
  const { label, description } = COPY[provenance];
  const Icon = provenance === "verified" ? BadgeCheck : Ruler;

  return (
    <Badge
      variant="outline"
      title={description}
      data-provenance={provenance}
      className={cn(
        "gap-1 border-transparent font-medium",
        provenance === "verified"
          ? "bg-provenance-verified-bg text-provenance-verified"
          : "bg-provenance-estimated-bg text-provenance-estimated",
        className,
      )}
    >
      <Icon aria-hidden className="size-3" />
      {label}
    </Badge>
  );
}
