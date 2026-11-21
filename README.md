# home

find a place to call yours. An interactive 3D Real estate demo for exploring buildings, floors and apartments, built with Next.js and React Three Fiber.

## Deploying to Vercel

The app builds on Vercel with zero configuration.

1. In Vercel, choose **Add New → Project** and import the `homeme` GitHub repository.
2. Keep the detected defaults: framework **Next.js**, install `pnpm install`, build `pnpm build`. Vercel reads the Node version from `engines` in `package.json`.
3. Optional: set `NEXT_PUBLIC_SITE_URL` (see `.env.example`). Without it, the production or preview URL is used.
4. Deploy. Afterwards:
   - every pull request gets a **preview deployment** (previews are excluded from search via `robots.txt`);
   - every merge to `main` deploys to **production**.

Vercel Analytics and Speed Insights are included and only load in production builds. Enable them in the Vercel project's **Analytics** and **Speed Insights** tabs.
