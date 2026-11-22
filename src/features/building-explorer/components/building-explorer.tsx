import { Section } from "@/components/layout/section";
import type { Project } from "@/domain/types";
import { DEMO_NOTICE } from "@/lib/constants";

import { summarizeFloors, summarizeUnits } from "../floor-summary";
import { FloorExplorer } from "./floor-explorer";

interface BuildingExplorerProps {
  project: Project;
}

/** Building explorer: 3D building, floor list and the apartments on the selected floor. */
export function BuildingExplorer({ project }: BuildingExplorerProps) {
  return (
    <Section>
      <p className="text-sm text-muted-foreground">{DEMO_NOTICE}</p>
      <h1 className="mt-4 text-4xl md:text-5xl">{project.name}</h1>
      <p className="mt-4 max-w-prose-narrow text-muted-foreground">{project.summary}</p>
      <div className="mt-stack">
        <FloorExplorer
          projectSlug={project.slug}
          projectName={project.name}
          building={project.building}
          floors={summarizeFloors(project)}
          units={summarizeUnits(project)}
        />
      </div>
    </Section>
  );
}
