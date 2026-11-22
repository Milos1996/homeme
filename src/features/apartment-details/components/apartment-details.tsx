import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import type { Apartment, Project } from "@/domain/types";
import { ApartmentViewer } from "@/features/apartment-viewer";
import { explorerHref } from "@/features/building-explorer";
import { DEMO_NOTICE } from "@/lib/constants";
import { formatRooms } from "@/lib/format";

import { ApartmentSpecs } from "./apartment-specs";
import { InquiryForm } from "./inquiry-form";
import { PlanComingSoon } from "./plan-coming-soon";
import { RoomBreakdown } from "./room-breakdown";

interface ApartmentDetailsProps {
  project: Project;
  apartment: Apartment;
}

/** Full apartment page: plan and 3D model, key facts, room breakdown and inquiry. */
export function ApartmentDetails({ project, apartment }: ApartmentDetailsProps) {
  const floor = project.building.floors.find((f) => f.id === apartment.floorId);
  const plan = apartment.floorPlan;

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
      <h1 className="mt-4 text-4xl md:text-6xl">Apartment {apartment.number}</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        {formatRooms(apartment.roomCount)} · {floor?.label}
      </p>

      <div className="mt-stack grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {plan ? (
            <ApartmentViewer plan={plan} apartmentNumber={apartment.number} />
          ) : (
            <PlanComingSoon apartmentNumber={apartment.number} />
          )}
        </div>
        <div className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
          <ApartmentSpecs apartment={apartment} floor={floor} projectName={project.name} />
        </div>
      </div>

      <div className="mt-section grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {plan ? (
            <RoomBreakdown plan={plan} />
          ) : (
            <p className="text-muted-foreground">
              A room-by-room breakdown will be added with the floor plan.
            </p>
          )}
          <p className="mt-6 text-sm text-muted-foreground" data-testid="provenance-legend">
            <span className="font-medium text-provenance-estimated">~</span> marks an estimated
            figure. Estimates are replaced with verified values once the developer&apos;s
            dimensioned unit plans are available; nothing is shown as verified until then.
          </p>
        </div>

        <section id="inquiry" aria-labelledby="inquiry-heading" className="scroll-mt-header">
          <h2 id="inquiry-heading" className="text-3xl">
            Ask about this home
          </h2>
          <p className="mt-3 mb-6 text-muted-foreground">
            {project.name} is a fictional demo, so no real sales team is behind this form.
          </p>
          {apartment.availability === "sold" ? (
            <p className="text-muted-foreground">
              This home has been sold. Explore other apartments on the same floor.
            </p>
          ) : (
            <InquiryForm apartmentLabel={`Apartment ${apartment.number} · ${project.name}`} />
          )}
        </section>
      </div>
    </Section>
  );
}
