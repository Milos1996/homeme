import { ArrowRight, Building2, Layers, Ruler } from "lucide-react";
import Link from "next/link";

import { ProvenanceBadge } from "@/components/common/provenance-badge";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { Project } from "@/domain/types";
import { formatLength } from "@/lib/format";

interface HomeHeroProps {
  project: Project;
}

/**
 * Placeholder homepage: tagline, featured development and the
 * "Explore in 3D" call to action. Full homepage is tracked in HOM-11.
 */
export function HomeHero({ project }: HomeHeroProps) {
  const { building } = project;
  const facts = [
    { icon: Layers, label: "Levels", value: `${building.floors.length}` },
    { icon: Building2, label: "Apartments per floor", value: "~13" },
    {
      icon: Ruler,
      label: "Floor-to-floor",
      value: formatLength(building.floorToFloorHeight),
      provenance: building.floorToFloorHeight.provenance,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <Container className="grid flex-1 items-center gap-stack py-section lg:grid-cols-[1.2fr_1fr]">
        <div className="animate-in duration-700 fade-in slide-in-from-bottom-2">
          <p className="text-sm font-medium tracking-wide text-forest-700 uppercase">
            {project.name}
          </p>
          <h1 className="mt-4 text-5xl leading-[1.05] font-normal md:text-7xl">
            Find a place to call yours.
          </h1>
          <p className="mt-6 max-w-prose-narrow text-lg text-muted-foreground">
            Walk through a residential building in 3D, pick a floor, and step inside the apartment
            that fits.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href={`/projects/${project.slug}`}>
                Explore in 3D
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              {project.name} is a fictional development.
            </span>
          </div>
        </div>

        <aside
          aria-label="Featured development"
          className="animate-in rounded-3xl bg-card p-6 shadow-raised duration-700 fade-in sm:p-8"
        >
          <h2 className="text-2xl">{project.name}</h2>
          <p className="mt-3 text-muted-foreground">{project.summary}</p>
          <dl className="mt-8 grid gap-5">
            {facts.map(({ icon: Icon, label, value, provenance }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon aria-hidden className="size-4" />
                </span>
                <div className="flex flex-1 items-center justify-between gap-3">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="flex items-center gap-2 font-medium whitespace-nowrap">
                    {value}
                    {provenance && <ProvenanceBadge provenance={provenance} />}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </aside>
      </Container>
    </div>
  );
}
