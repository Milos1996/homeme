import type { MetadataRoute } from "next";

import { env, siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Only the production deployment is indexable; previews stay out of search.
  const indexable = env.VERCEL_ENV === undefined || env.VERCEL_ENV === "production";

  return {
    rules: indexable ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
