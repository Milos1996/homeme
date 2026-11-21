import { ProvenanceBadge } from "@/components/common/provenance-badge";
import { Section } from "@/components/layout/section";
import type { Apartment, Project } from "@/domain/types";
import { ApartmentViewer3D, FloorPlan2D } from "@/features/apartment-viewer";
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
        <ApartmentViewer3D
          plan={apartment.floorPlan}
          label={`3D model of apartment ${apartment.number}`}
          className="mt-stack max-w-3xl"
        />
      )}
      {apartment.floorPlan && (
        <div className="mt-stack max-w-3xl rounded-3xl bg-card p-6 shadow-soft sm:p-10">
          <FloorPlan2D
            plan={apartment.floorPlan}
            title={`Floor plan of apartment ${apartment.number}`}
          />
        </div>
      )}
    </Section>
  );
}
