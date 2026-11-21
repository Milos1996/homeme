import type { MetadataRoute } from "next";

import { getProjects } from "@/data";
import { siteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteUrl).toString();

  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    ...getProjects().flatMap((project) => [
      { url: url(`/projects/${project.slug}`), changeFrequency: "weekly" as const, priority: 0.8 },
      ...project.apartments.map((apartment) => ({
        url: url(`/projects/${project.slug}/apartments/${apartment.id}`),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ]),
  ];
}
