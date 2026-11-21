import { z } from "zod";

/**
 * Typed, validated environment. Import `env` instead of reading
 * `process.env` directly. Add new variables here and to `.env.example`.
 *
 * Vercel sets VERCEL_ENV, VERCEL_URL and VERCEL_PROJECT_PRODUCTION_URL
 * automatically (without protocol).
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Canonical site URL, e.g. https://homeme.example. Optional; falls back to Vercel URLs. */
  NEXT_PUBLIC_SITE_URL: z.url().exactOptional(),
  VERCEL_ENV: z.enum(["production", "preview", "development"]).exactOptional(),
  VERCEL_URL: z.string().min(1).exactOptional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().min(1).exactOptional(),
});

const parsed = EnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  ...pick("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL),
  ...pick("VERCEL_ENV", process.env.VERCEL_ENV),
  ...pick("VERCEL_URL", process.env.VERCEL_URL),
  ...pick("VERCEL_PROJECT_PRODUCTION_URL", process.env.VERCEL_PROJECT_PRODUCTION_URL),
});

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;

/** Absolute base URL for metadata, sitemap and Open Graph. */
export const siteUrl = new URL(
  env.NEXT_PUBLIC_SITE_URL ??
    (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : env.VERCEL_URL
        ? `https://${env.VERCEL_URL}`
        : "http://localhost:3000"),
);

/** Treat empty strings as unset so `.exactOptional()` fields stay absent. */
function pick<K extends string>(key: K, value: string | undefined): Partial<Record<K, string>> {
  return value ? ({ [key]: value } as Record<K, string>) : {};
}
