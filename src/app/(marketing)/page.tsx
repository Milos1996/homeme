import { notFound } from "next/navigation";

import { getProject } from "@/data";
import { HomeHero } from "@/features/home";

const FEATURED_PROJECT = "linden-court";

export default function HomePage() {
  const project = getProject(FEATURED_PROJECT);
  if (!project) notFound();

  return <HomeHero project={project} />;
}
