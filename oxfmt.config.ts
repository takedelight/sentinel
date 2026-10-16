import { defineConfig } from "oxfmt";

// Single oxfmt config for the whole monorepo. oxfmt resolves the nearest config
// for every formatted file, so running the format task from an app directory
// (`apps/*`) still picks this file up. Paths in `overrides` and
// `ignorePatterns` are relative to this config (repo root).
export default defineConfig({
  printWidth: 100,
  endOfLine: "lf",
  ignorePatterns: ["apps/web/src/shared/ui/**", "packages/ui/src/**", "apps/api/drizzle/**"],
  overrides: [
    {
      files: ["apps/web/**"],
      options: {
        sortImports: {
          groups: [
            "type-import",
            ["value-builtin", "value-external"],
            "type-internal",
            "value-internal",
            ["type-parent", "type-sibling", "type-index"],
            ["value-parent", "value-sibling", "value-index"],
            "unknown",
          ],
        },
        sortTailwindcss: {
          stylesheet: "apps/web/src/app/globals.css",
          functions: ["clsx", "cn"],
          preserveWhitespace: true,
        },
      },
    },
  ],
});
