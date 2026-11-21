import { ProjectSchema } from "@/domain/schemas";
import type { Apartment, Project } from "@/domain/types";

import { lindenCourt } from "./projects/linden-court/project";

/**
 * Registry of all projects. To add a project, create
 * `src/data/projects/<slug>/` and register it here. Every entry is
 * validated with zod at module load, so invalid data fails the build.
 */
const registry: readonly Project[] = [lindenCourt].map((project) => ProjectSchema.parse(project));

export function getProjects(): readonly Project[] {
  return registry;
}

export function getProject(slug: string): Project | undefined {
  return registry.find((p) => p.slug === slug);
}

export function getApartment(projectSlug: string, apartmentId: string): Apartment | undefined {
  return getProject(projectSlug)?.apartments.find((a) => a.id === apartmentId);
}
