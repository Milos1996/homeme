import type { Metadata } from "next";

import type { Apartment, Project } from "@/domain/types";
import { formatArea, formatRooms } from "@/lib/format";

const STATUS: Record<Apartment["availability"], string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

/** Per-unit title and description, e.g. "Apartment 3.02 · Linden Court". */
export function apartmentMetadata(project: Project, apartment: Apartment): Metadata {
  const floor = project.building.floors.find((f) => f.id === apartment.floorId);
  const title = `Apartment ${apartment.number} · ${project.name}`;
  const description = `${formatRooms(apartment.roomCount)} of ${formatArea(apartment.area)} on ${
    floor?.label ?? "an upper floor"
  } at ${project.name}. ${STATUS[apartment.availability]}.${
    project.isDemo ? " Fictional demo development." : ""
  }`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}
