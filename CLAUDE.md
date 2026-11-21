# HomeMe — guide for Claude Code

@AGENTS.md

## Product

HomeMe ("Find a place to call yours") is an interactive 3D real estate demo for one fictional development, **Linden Court**: a raised ground floor + 7 floors, central corridor with stairs and lift, ~13 apartments per floor.
Journey: homepage → 3D building explorer → floor selection → apartment list → apartment detail (2D plan, 3D viewer, inquiry form).
All data is local TS. No backend, auth or database. Deploys to Vercel. Desktop first, responsive.

**Provenance rule:** every dimension is a `Dimension` with `provenance: "verified" | "estimated"`. The UI must never present an estimate as verified. Use `formatArea`/`formatLength` (prefix estimates with `~`) and `ProvenanceBadge`. Only mark a value `verified` when it is read directly from a dimensioned plan, and cite it in `source`.

## Stack and why

| Piece                                                                           | Why                                                       |
| ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Next.js 16 App Router, Turbopack, `cacheComponents`                             | Static-first pages, file routing, fast dev, Vercel-native |
| TypeScript 6 (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | Catch data and geometry mistakes at compile time          |
| Tailwind v4 + shadcn/ui (Radix)                                                 | Token-driven styling, accessible primitives we own        |
| three + React Three Fiber 9 + Drei 10                                           | Declarative 3D generated from data                        |
| Zustand                                                                         | Small per-feature client state (viewer mode, selection)   |
| Motion                                                                          | Transitions and micro-interactions                        |
| zod 4                                                                           | Validate all data at load time; mirror domain types       |
| Lucide                                                                          | Icons                                                     |
| Vitest, RTL, @react-three/test-renderer, Playwright                             | Unit, component, scene and e2e tests                      |

Versions are pinned exactly. TS 6 and ESLint 9 are held back on purpose: typescript-eslint and eslint-config-next's plugins don't support TS 7 / ESLint 10 yet.

## Where code goes

```
src/app/          routes only: thin pages that load data and render a feature
src/features/<f>/ components/, hooks/, store.ts (zustand), index.ts = public API
src/components/   ui/ (shadcn, generated) · layout/ · common/ (ProvenanceBadge…)
src/three/        R3F building blocks: meshes from domain geometry, materials, lights, cameras, palette
src/domain/       pure TS: types/, schemas/ (zod), geometry/, selectors/
src/data/         projects/<slug>/{project,building,apartments}.ts + registry in data/index.ts
src/lib/          cn, formatters, constants, env, fonts
src/test/         shared test utils (R3F Canvas mock)
tests/e2e/        Playwright specs · tests/fixtures/ sample floor plans
```

Import boundaries (ESLint enforces them, so `pnpm lint` fails on violations):

- `domain` imports nothing outside `domain` (no React, Next, three, no `@/` alias; use relative imports).
- `lib` → domain. `data` → domain, lib. `three` → domain, lib. `components` → components, domain, lib.
- `features` → components, three, domain, lib, data. Other features **only via `@/features/<name>`** (their `index.ts`). Inside a feature, use relative imports.
- `app` → features, components, lib, data. Never three.

Recipes:

- New geometry → `src/domain/geometry/*.ts` + `*.test.ts` next to it.
- New data shape → type in `domain/types`, zod schema in `domain/schemas` with `satisfies z.ZodType<T>` (use `.exactOptional()` for optional fields), plus valid and invalid tests.
- New 3D object → `src/three/` component that takes domain data as props; used by a feature.
- New UI flow → `src/features/<f>/components`, exported from the feature's `index.ts`, rendered by a route.
- New shadcn primitive → `pnpm dlx shadcn@4.23.0 add <name>` (lands in `components/ui`).

## Commands

```
pnpm dev            # Turbopack dev server
pnpm build / start  # production build / serve
pnpm lint | lint:fix | format | format:check
pnpm typecheck      # next typegen && tsc --noEmit
pnpm test | test:watch | test:coverage
pnpm test:e2e | test:e2e:ui   # Playwright against next build && next start
pnpm check          # lint + typecheck + test (must pass before every commit)
```

Husky runs lint-staged (eslint --fix, prettier, typecheck) on commit and commitlint on the message.

## Testing expectations

- `src/domain/**` must be unit tested. Coverage threshold: 90% lines/branches/functions/statements.
- Each feature needs an RTL test for its main interaction (no WebGL: mock `Canvas` with `src/test/mock-r3f-canvas.tsx`).
- Use `@react-three/test-renderer` for scene composition ("N floors → N meshes").
- Each user journey gets a Playwright spec. Drive 3D through accessible DOM overlays (`data-testid` on floor buttons, apartment list), not pixel clicks. Screenshot tests use the tolerance in `playwright.config.ts`.
- Tests live next to source as `*.test.ts(x)`; e2e in `tests/e2e`.

## 3D rules

- Geometry is generated from data, never hand-placed or hardcoded meshes.
- Canvases are client-only: use `LazySceneCanvas` from `@/three` (next/dynamic, `ssr: false`, styled loading state).
- `frameloop="demand"` (default in `SceneCanvas`); call `invalidate()` after changes. Cap DPR.
- Keep heavy work out of `useFrame`. Memoize geometries and materials (`useMemo`) and dispose them on unmount.
- Keep draw calls low: share geometries/materials, use instancing for repeated elements (windows, units).
- Material colours come from `src/three/palette.ts`, which mirrors the CSS tokens.

## Design rules

- Tokens only: colours, radius, shadows, spacing and widths come from `src/app/globals.css` (`bg-background`, `text-forest-700`, `shadow-soft`, `py-section`, `px-gutter`, `max-w-content`…). No hex values or arbitrary pixel values in components.
- Premium and minimal: warm white, charcoal, sage/forest accents, generous whitespace. Fraunces (`font-display`) for headings, Inter (`font-sans`) for UI.
- No gradients and no SaaS-dashboard look (dense cards, KPI tiles, heavy borders).
- Motion for transitions; always respect `prefers-reduced-motion`.
- Label fictional content clearly (`DEMO_NOTICE`).

## Git workflow

- `main` is protected by CI. One Linear issue → one branch → one small PR.
- Branches: `feat/hom-<id>-<slug>`, `fix/hom-<id>-<slug>`, `chore/hom-<id>-<slug>`.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `ci:`, `docs:`, `refactor:`), with `Refs HOM-<id>` in the body.
- The PR uses `.github/pull_request_template.md` and links the Linear issue. Merge only when CI is green.
- Linear workspace "HomeMe", team `HOM`, project "HomeMe — 3D real estate demo" (Linear MCP is configured in `.mcp.json`).

## Adding a project, building or apartment

Data only, no code changes:

1. Create `src/data/projects/<slug>/` with `building.ts`, `apartments.ts` and `project.ts` typed as `Building`, `Apartment[]` and `Project`.
2. Register the project in `src/data/index.ts`.
3. Every dimension needs a `provenance`. Demo inventory is always `estimated`, and `isDemo: true`.
4. `ProjectSchema` validates it at load time (floors exist, ids unique, openings fit their walls), so invalid data fails `pnpm build` and the tests.
5. Routes, sitemap and static params pick it up automatically.
