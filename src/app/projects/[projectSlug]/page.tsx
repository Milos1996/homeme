import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProject, getProjects } from "@/data";
import { BuildingExplorer } from "@/features/building-explorer";

export function generateStaticParams() {
  return getProjects().map((project) => ({ projectSlug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[projectSlug]">): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = getProject(projectSlug);
  return project ? { title: project.name, description: project.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[projectSlug]">) {
  const { projectSlug } = await params;
  const project = getProject(projectSlug);
  if (!project) notFound();

  return <BuildingExplorer project={project} />;
}
