/** Runs on `git commit` via Husky. Type checking covers the whole project, since types cross files. */
const config = {
  // Type-aware lint needs Next's generated route types (PageProps, LayoutProps).
  "*.{ts,tsx,mts,js,mjs}": [
    () => "next typegen",
    "eslint --fix --max-warnings=0",
    "prettier --write",
  ],
  "*.{json,md,css,yml,yaml}": ["prettier --write"],
  "*.{ts,tsx,mts}": () => "pnpm typecheck",
};

export default config;
