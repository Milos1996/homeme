import type { Project } from "@/domain/types";

import { apartments } from "./apartments";
import { building } from "./building";

export const lindenCourt: Project = {
  slug: "linden-court",
  name: "Linden Court",
  tagline: "Find a place to call yours.",
  summary:
    "A fictional residential development: a raised ground floor plus seven floors around a central corridor with stairs and a lift.",
  setting: "Leafy residential quarter, a short walk from a park and the tram line",
  typicalUnitsPerFloor: 13,
  isDemo: true,
  building,
  apartments,
};
