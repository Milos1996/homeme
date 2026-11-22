import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ProvenanceBadge } from "@/components/common/provenance-badge";
import { Section } from "@/components/layout/section";
import type { Apartment, Project } from "@/domain/types";
import { ApartmentViewer } from "@/features/apartment-viewer";
import { explorerHref } from "@/features/building-explorer";
import { DEMO_NOTICE } from "@/lib/constants";
import { formatArea } from "@/lib/format";

interface ApartmentDetailsProps {
  project: Project;
  apartment: Apartment;
}

/** Apartment detail entry point. Specs, 2D/3D viewer and inquiry form land in M4. */
export function ApartmentDetails({ project, apartment }: ApartmentDetailsProps) {
  const floor = project.building.floors.find((f) => f.id === apartment.floorId);

  return (
    <Section>
      <Link
        href={explorerHref(project.slug, floor?.level)}
        className="mb-6 inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to {floor ? floor.label : project.name}
      </Link>
      <p className="text-sm text-muted-foreground">
        {project.name} · {DEMO_NOTICE}
      </p>
      <h1 className="mt-4 text-4xl md:text-5xl">Apartment {apartment.number}</h1>
      <dl className="mt-stack flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Area</dt>
          <dd className="flex items-center gap-2 text-lg">
            {formatArea(apartment.area)}
            <ProvenanceBadge provenance={apartment.area.provenance} />
          </dd>
        </div>
        <div>
          <dt className="sr-only">Rooms</dt>
          <dd className="text-lg">{apartment.roomCount} rooms</dd>
        </div>
      </dl>
      {apartment.floorPlan && (
        <ApartmentViewer
          plan={apartment.floorPlan}
          apartmentNumber={apartment.number}
          className="mt-stack max-w-3xl"
        />
      )}
    </Section>
  );
}
