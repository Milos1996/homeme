import { ProvenanceBadge } from "@/components/common/provenance-badge";
import { Section } from "@/components/layout/section";
import type { Apartment, Project } from "@/domain/types";
import { DEMO_NOTICE } from "@/lib/constants";
import { formatArea } from "@/lib/format";

interface ApartmentDetailsProps {
  project: Project;
  apartment: Apartment;
}

/** Apartment detail entry point. Specs, 2D/3D viewer and inquiry form land in M4. */
export function ApartmentDetails({ project, apartment }: ApartmentDetailsProps) {
  return (
    <Section>
      <p className="text-sm text-muted-foreground">
        {project.name} · {DEMO_NOTICE}
      </p>
      <h1 className="mt-4 text-4xl md:text-5xl">Apartment {apartment.number}</h1>
      <dl className="mt-stack flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Area</dt>
          <dd className="text-lg">{formatArea(apartment.area)}</dd>
          <ProvenanceBadge provenance={apartment.area.provenance} />
        </div>
        <div>
          <dt className="sr-only">Rooms</dt>
          <dd className="text-lg">{apartment.roomCount} rooms</dd>
        </div>
      </dl>
    </Section>
  );
}
