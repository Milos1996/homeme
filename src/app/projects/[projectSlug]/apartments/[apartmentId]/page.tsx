import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getApartment, getProject, getProjects } from "@/data";
import { ApartmentDetails } from "@/features/apartment-details";

type Props = PageProps<"/projects/[projectSlug]/apartments/[apartmentId]">;

export function generateStaticParams() {
  return getProjects().flatMap((project) =>
    project.apartments.map((apartment) => ({
      projectSlug: project.slug,
      apartmentId: apartment.id,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectSlug, apartmentId } = await params;
  const project = getProject(projectSlug);
  const apartment = getApartment(projectSlug, apartmentId);
  return project && apartment ? { title: `Apartment ${apartment.number} · ${project.name}` } : {};
}

export default async function ApartmentPage({ params }: Props) {
  const { projectSlug, apartmentId } = await params;
  const project = getProject(projectSlug);
  const apartment = getApartment(projectSlug, apartmentId);
  if (!project || !apartment) notFound();

  return <ApartmentDetails project={project} apartment={apartment} />;
}
