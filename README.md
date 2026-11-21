# HomeMe

**Find a place to call yours.** An interactive 3D real estate demo for exploring a building, its floors and apartments, built with Next.js and React Three Fiber.

HomeMe showcases one fictional development, **Linden Court**: a raised ground floor plus 7 floors around a central corridor with stairs and a lift, with about 13 apartments per floor. Visitors go from the homepage to a 3D building explorer, pick a floor, browse the apartments, and open an apartment page with a 2D plan, a 3D viewer and an inquiry form.

All content is local TypeScript data. There is no backend. Every dimension is marked **verified** or **estimated**, and estimates are never shown as verified.

> Linden Court is fictional demo content, not a real listing.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 6 (strict) · Tailwind CSS 4 · shadcn/ui · three.js · React Three Fiber 9 · Drei 10 · Zustand · Motion · zod · Lucide · Vitest · Testing Library · Playwright · Vercel

## Getting started

Requirements: **Node 26 LTS** (see `.nvmrc`) and **pnpm 12** (see `packageManager` in `package.json`).

```bash
nvm use                       # or install Node 26 another way
npm install -g pnpm@12.21.0   # if pnpm isn't installed
pnpm install
pnpm dev                      # http://localhost:3000
```

For end-to-end tests, install the Playwright browsers once:

```bash
pnpm exec playwright install chromium webkit
```

Copy `.env.example` to `.env.local` if you need to override anything. No variables are required.

## Scripts

| Script                              | What it does                                                             |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`                          | Dev server with Turbopack                                                |
| `pnpm build` / `pnpm start`         | Production build / serve it                                              |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (type-aware, a11y, import boundaries)                             |
| `pnpm format` / `pnpm format:check` | Prettier (with Tailwind class sorting)                                   |
| `pnpm typecheck`                    | Generate Next route types, then `tsc --noEmit`                           |
| `pnpm test` / `test:watch`          | Vitest unit and component tests                                          |
| `pnpm test:coverage`                | Tests with coverage (90% threshold on `src/domain`)                      |
| `pnpm test:e2e` / `test:e2e:ui`     | Playwright against `next build && next start` (Chromium, WebKit, iPhone) |
| `pnpm check`                        | Lint + typecheck + tests. **Must pass before every commit.**             |

Git hooks (Husky) run ESLint, Prettier and the typecheck on staged files, and check commit messages against [Conventional Commits](https://www.conventionalcommits.org).

## Project structure

```
src/
  app/                 routes only: thin pages that compose features
    (marketing)/       homepage
    projects/[projectSlug]/                         building explorer
    projects/[projectSlug]/apartments/[apartmentId]/ apartment detail
  components/
    ui/                shadcn/ui primitives (generated)
    layout/            Container, Section, header/footer
    common/            shared pieces such as ProvenanceBadge
  features/            home, building-explorer, apartment-viewer, apartment-details
                       each: components/, hooks/, store.ts, index.ts (public API)
  domain/              pure TypeScript: types, zod schemas, geometry, selectors
  three/               React Three Fiber building blocks, scene palette, lazy canvas
  data/                local project data, validated with zod at load time
  lib/                 utilities, formatters, constants, env, fonts
  test/                shared test utilities
tests/
  e2e/                 Playwright specs
  fixtures/            sample floor plans for tests
```

Import boundaries are enforced by ESLint. `domain` stays framework-free, features talk to each other only through their `index.ts`, and routes only compose features. See [CLAUDE.md](CLAUDE.md) for the full rules, testing expectations, 3D guidelines and how to add a new project or apartment with data only.

## Workflow

- Work is tracked in Linear (team `HOM`). Use one branch per issue: `feat/hom-<id>-<slug>`, `fix/…` or `chore/…`.
- Open a small PR using the template, with the Linear issue linked.
- CI (GitHub Actions) runs lint, typecheck, unit tests with coverage, build and Playwright. Merge only when it's green.
- Dependabot opens grouped dependency updates weekly.

## Deploying to Vercel

The app builds on Vercel with zero configuration.

1. In Vercel, choose **Add New → Project** and import the `homeme` GitHub repository.
2. Keep the detected defaults: framework **Next.js**, install `pnpm install`, build `pnpm build`. Vercel reads the Node version from `engines` in `package.json`.
3. Optional: set `NEXT_PUBLIC_SITE_URL` (see `.env.example`). Without it, the production or preview URL is used.
4. Deploy. After that:
   - every pull request gets a **preview deployment** (previews are kept out of search via `robots.txt`);
   - every merge to `main` deploys to **production**.

Vercel Analytics and Speed Insights are included. They load only on Vercel deployments, not in local dev, local production builds or CI. Turn them on in the Vercel project's **Analytics** and **Speed Insights** tabs.

## Tooling notes

- **TypeScript 6.0, not 7.** typescript-eslint, which the type-aware lint rules depend on, supports TypeScript below 6.1.
- **ESLint 9, not 10.** eslint-config-next's bundled plugins (jsx-a11y, import, react) declare ESLint ≤ 9.
- Dependabot ignores major updates for both until their peers catch up.
