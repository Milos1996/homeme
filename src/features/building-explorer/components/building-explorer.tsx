import { Section } from "@/components/layout/section";
import type { Project } from "@/domain/types";
import { DEMO_NOTICE } from "@/lib/constants";

import { BuildingViewer3D } from "./building-viewer-3d";

interface BuildingExplorerProps {
  project: Project;
}

/** Building explorer: the 3D building. Floor picker and apartment panel follow in M3. */
export function BuildingExplorer({ project }: BuildingExplorerProps) {
  return (
    <Section>
      <p className="text-sm text-muted-foreground">{DEMO_NOTICE}</p>
      <h1 className="mt-4 text-4xl md:text-5xl">{project.name}</h1>
      <p className="mt-4 max-w-prose-narrow text-muted-foreground">{project.summary}</p>
      <BuildingViewer3D
        building={project.building}
        label={`3D model of ${project.name}`}
        className="mt-stack"
      />
    </Section>
  );
}
