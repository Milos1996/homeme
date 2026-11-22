import { Section } from "@/components/layout/section";
import type { Project } from "@/domain/types";
import { DEMO_NOTICE } from "@/lib/constants";

import { summarizeFloors } from "../floor-summary";
import { FloorExplorer } from "./floor-explorer";

interface BuildingExplorerProps {
  project: Project;
}

/** Building explorer: 3D building with floor hover and selection. The apartment panel follows. */
export function BuildingExplorer({ project }: BuildingExplorerProps) {
  return (
    <Section>
      <p className="text-sm text-muted-foreground">{DEMO_NOTICE}</p>
      <h1 className="mt-4 text-4xl md:text-5xl">{project.name}</h1>
      <p className="mt-4 max-w-prose-narrow text-muted-foreground">{project.summary}</p>
      <div className="mt-stack">
        <FloorExplorer
          projectName={project.name}
          building={project.building}
          floors={summarizeFloors(project)}
        />
      </div>
    </Section>
  );
}
