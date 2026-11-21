import { notFound } from "next/navigation";

import { getProject } from "@/data";
import { HomeHero } from "@/features/home";
import { FEATURED_PROJECT_SLUG } from "@/lib/constants";

export default function HomePage() {
  const project = getProject(FEATURED_PROJECT_SLUG);
  if (!project) notFound();

  return <HomeHero project={project} />;
}
