import { ArrowRight, Building2, Layers, MapPin, Ruler } from "lucide-react";
import Link from "next/link";

import { ProvenanceBadge } from "@/components/common/provenance-badge";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/domain/types";
import { formatLength } from "@/lib/format";

interface FeaturedDevelopmentProps {
  project: Project;
}

/** Key facts about the featured (fictional) development. */
export function FeaturedDevelopment({ project }: FeaturedDevelopmentProps) {
  const { building } = project;
  const aboveGround = building.floors.filter((f) => f.level > 0).length;

  const facts = [
    { icon: MapPin, label: "Setting", value: project.setting },
    {
      icon: Layers,
      label: "Levels",
      value: `Raised ground floor + ${aboveGround} floors`,
    },
    {
      icon: Building2,
      label: "Apartments",
      value: `${project.apartments.length} homes, ~${project.typicalUnitsPerFloor} per floor`,
    },
    {
      icon: Ruler,
      label: "Floor-to-floor height",
      value: formatLength(building.floorToFloorHeight),
      provenance: building.floorToFloorHeight.provenance,
    },
  ];

  return (
    <Section aria-labelledby="featured-heading" className="bg-paper">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          {project.isDemo && (
            <Badge variant="outline" className="border-stone-200 text-muted-foreground">
              Fictional demo development
            </Badge>
          )}
          <h2 id="featured-heading" className="mt-4 text-4xl md:text-5xl">
            {project.name}
          </h2>
          <p className="mt-4 max-w-prose-narrow text-lg text-muted-foreground">{project.summary}</p>
          <Link
            href={`/projects/${project.slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-sm font-medium text-forest-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Explore {project.name} in 3D
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        <dl className="grid gap-px overflow-hidden rounded-3xl bg-stone-200 sm:grid-cols-2">
          {facts.map(({ icon: Icon, label, value, provenance }) => (
            <div key={label} className="flex flex-col gap-3 bg-paper p-6">
              <dt className="flex flex-col gap-3 text-sm text-muted-foreground">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon aria-hidden className="size-4" />
                </span>
                {label}
              </dt>
              <dd className="flex flex-wrap items-center gap-2 text-lg">
                {value}
                {provenance && <ProvenanceBadge provenance={provenance} />}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
