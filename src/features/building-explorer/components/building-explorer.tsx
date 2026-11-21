import { Section } from "@/components/layout/section";
import type { Project } from "@/domain/types";
import { DEMO_NOTICE } from "@/lib/constants";

interface BuildingExplorerProps {
  project: Project;
}

/** Building explorer entry point. The 3D building, floor picker and apartment panel land in M3. */
export function BuildingExplorer({ project }: BuildingExplorerProps) {
  return (
    <Section>
      <p className="text-sm text-muted-foreground">{DEMO_NOTICE}</p>
      <h1 className="mt-4 text-4xl md:text-5xl">{project.name}</h1>
      <p className="mt-4 max-w-prose-narrow text-muted-foreground">{project.summary}</p>
      <p className="mt-stack text-sm text-muted-foreground">
        {project.building.floors.length} levels · 3D explorer coming soon
      </p>
    </Section>
  );
}
