import { readdirSync } from "node:fs";

import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/* ------------------------------------------------------------------ */
/* Architecture boundaries                                             */
/* ------------------------------------------------------------------ */
// domain     → nothing (pure TS: no React, Next.js or three)
// lib        → domain
// data       → domain, lib
// three      → domain, lib
// components → components, domain, lib
// features   → components, three, domain, lib, data, other features ONLY via their index.ts
// app        → features, components, lib, data (composition only, no three)

const features = readdirSync(new URL("./src/features", import.meta.url), {
  withFileTypes: true,
})
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const zone = (target, from, message, except) => ({
  target: `./src/${target}`,
  from: from.map((f) => `./src/${f}`),
  ...(except ? { except } : {}),
  message,
});

const boundaryZones = [
  zone(
    "domain",
    ["app", "features", "components", "three", "data", "lib"],
    "domain/ is pure TS and must not import from other layers.",
  ),
  zone("lib", ["app", "features", "components", "three", "data"], "lib/ may only import domain/."),
  zone(
    "data",
    ["app", "features", "components", "three"],
    "data/ may only import domain/ and lib/.",
  ),
  zone(
    "three",
    ["app", "features", "components", "data"],
    "three/ may only import domain/ and lib/.",
  ),
  zone(
    "components",
    ["app", "features", "three", "data"],
    "components/ may only import components/, domain/ and lib/.",
  ),
  zone("features", ["app"], "features/ must not import from app/."),
  zone("app", ["three"], "app/ composes features; render 3D through a feature."),
  // Cross-feature imports must go through the other feature's public index.ts.
  ...features.flatMap((a) =>
    features
      .filter((b) => b !== a)
      .map((b) =>
        zone(
          `features/${a}`,
          [`features/${b}`],
          `Import "${b}" through its public API (@/features/${b}), not its internals.`,
          ["./index.ts"],
        ),
      ),
  ),
];

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
    "src/components/ui/**", // generated shadcn primitives
  ]),

  ...nextVitals,

  // Type-aware TypeScript rules
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({ ...c, files: ["**/*.{ts,tsx,mts}"] })),
  {
    files: ["**/*.{ts,tsx,mts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },

  // Accessibility: full jsx-a11y recommended set (plugin is registered by next config)
  {
    files: ["**/*.{jsx,tsx}"],
    rules: jsxA11y.flatConfigs.recommended.rules,
  },

  // Import hygiene and architecture boundaries
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          pathGroupsExcludedImportTypes: ["builtin"],
          distinctGroup: false,
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",
      "import/no-cycle": ["error", { maxDepth: 3 }],
      "import/no-restricted-paths": ["error", { zones: boundaryZones }],
    },
  },
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-dom",
                "react/*",
                "next",
                "next/*",
                "three",
                "three/*",
                "@react-three/*",
              ],
              message: "domain/ is framework-free. Move rendering code to three/ or features/.",
            },
            {
              group: ["@/*"],
              message: "domain/ only imports from domain/ (use relative imports).",
            },
          ],
        },
      ],
    },
  },

  // Tests: relax type-aware strictness that fights test ergonomics
  {
    files: ["**/*.test.{ts,tsx}", "tests/**/*.{ts,tsx}", "vitest.setup.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/unbound-method": "off",
      "import/no-restricted-paths": "off",
    },
  },

  // Config files are not part of the TS project
  {
    files: ["*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },

  // Must be last: turn off rules that conflict with Prettier
  prettier,
]);
