import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { Project } from "@/domain/types";

import { BuildingElevation } from "./building-elevation";

interface HomeHeroProps {
  project: Project;
}

/** Tagline, intro and the primary "Explore in 3D" call to action. */
export function HomeHero({ project }: HomeHeroProps) {
  return (
    <Container className="grid items-center gap-16 py-section lg:grid-cols-[1.15fr_1fr]">
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
          <Button asChild size="lg" className="group rounded-full px-6">
            <Link href={`/projects/${project.slug}`}>
              Explore in 3D
              <ArrowRight
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            {project.name} is a fictional development.
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md animate-in rounded-3xl bg-stone-100 p-8 duration-700 fade-in sm:p-12">
        <BuildingElevation
          building={project.building}
          unitsPerFloor={project.typicalUnitsPerFloor}
        />
      </div>
    </Container>
  );
}
