import { fileURLToPath } from "node:url";

import { defineConfig } from "oxlint";

// The Tailwind plugin resolves relative CSS paths from the linted file's
// nearest package root, so pass an absolute path instead.
const webGlobalsCss = fileURLToPath(new URL("./apps/web/src/app/globals.css", import.meta.url));

// Single oxlint config for the whole monorepo. oxlint resolves the nearest
// config for every linted file, so running the lint task from an app directory
// (`apps/*`) still picks this file up. App-specific rule sets live in the
// `overrides` block below; paths there are relative to this config (repo root).
export default defineConfig({
  categories: {
    correctness: "error",
    perf: "warn",
    suspicious: "warn",
  },
  settings: {
    react: {
      version: "19.2",
    },
    tailwindcss: {
      cssConfigPath: webGlobalsCss,
    },
  },
  ignorePatterns: ["apps/web/src/shared/ui/**", "apps/api/drizzle/**"],
  overrides: [
    /* === WEB (@sentinel/web) === */
    {
      files: ["apps/web/**"],
      plugins: [
        "react",
        "nextjs",
        "typescript",
        "import",
        "jsx-a11y",
        "unicorn",
        "oxc",
        "react-perf",
        "promise",
        "vitest",
      ],
      env: {
        builtin: true,
        browser: true,
      },
      jsPlugins: [{ name: "tailwindcss", specifier: "eslint-plugin-tailwindcss" }],
      rules: {
        "nextjs/google-font-display": "error",
        "nextjs/google-font-preconnect": "error",
        "nextjs/inline-script-id": "error",
        "nextjs/next-script-for-ga": "error",
        "nextjs/no-assign-module-variable": "error",
        "nextjs/no-async-client-component": "error",
        "nextjs/no-before-interactive-script-outside-document": "error",
        "nextjs/no-css-tags": "error",
        "nextjs/no-document-import-in-page": "error",
        "nextjs/no-duplicate-head": "error",
        "nextjs/no-head-element": "error",
        "nextjs/no-head-import-in-document": "error",
        "nextjs/no-html-link-for-pages": "error",
        "nextjs/no-script-component-in-head": "error",
        "nextjs/no-styled-jsx-in-document": "error",
        "nextjs/no-sync-scripts": "error",
        "nextjs/no-title-in-document-head": "error",
        "nextjs/no-typos": "error",
        "nextjs/no-unwanted-polyfillio": "error",
        "nextjs/no-page-custom-font": "error",

        "nextjs/no-img-element": "error",

        /* === IMPORTS === */
        // Next.js App Router импортирует глобальные стили без присваивания
        "import/no-unassigned-import": "off",
        "import/no-self-import": "error",
        "import/no-cycle": "warn",
        "import/no-duplicates": "warn",
        "import/no-anonymous-default-export": "warn",

        /* === REACT & HOOKS === */
        // Next.js использует automatic JSX runtime (React 17+), React в скоупе не нужен
        "react/react-in-jsx-scope": "off",
        "react/rules-of-hooks": "error",
        "react/exhaustive-deps": "warn",
        "react/jsx-key": "error",
        "react/jsx-no-duplicate-props": "error",
        "react/jsx-no-undef": "error",
        "react/jsx-no-useless-fragment": "warn",
        "react/no-children-prop": "error",
        "react/no-danger-with-children": "error",
        "react/no-direct-mutation-state": "error",
        "react/no-find-dom-node": "error",
        "react/no-is-mounted": "error",
        "react/no-render-return-value": "error",
        "react/no-string-refs": "error",
        "react/no-unescaped-entities": "error",
        "react/no-unknown-property": "error",
        "react/require-render-return": "error",
        "react/void-dom-elements-no-children": "error",

        /* === TAILWIND CSS (jsPlugins: eslint-plugin-tailwindcss) === */
        "tailwindcss/no-contradicting-classname": "error",
        "tailwindcss/important-modifier-suffix": "warn",
        "tailwindcss/enforces-shorthand": "warn",
        "tailwindcss/enforces-negative-arbitrary-values": "warn",
        "tailwindcss/no-arbitrary-value": "warn",
      },
    },

    /* === API (@sentinel/api) === */
    {
      files: ["apps/api/**"],
      jsPlugins: ["eslint-plugin-drizzle"],
      rules: {
        "no-restricted-properties": [
          "error",
          {
            object: "Bun",
            property: "env",
            message: "Use import { env } from src/utils/env instead.",
          },
          {
            object: "process",
            property: "env",
            message: "Use import { env } from src/utils/env instead.",
          },
        ],
        "typescript/no-non-null-assertion": "error",
        "drizzle/enforce-delete-with-where": ["error", { drizzleObjectName: ["db"] }],
        "drizzle/enforce-update-with-where": ["error", { drizzleObjectName: ["db"] }],
      },
    },
    {
      files: ["apps/api/src/utils/env/index.ts"],
      rules: {
        "no-restricted-properties": "off",
        "no-console": "off",
        "unicorn/no-process-exit": "off",
      },
    },
    {
      files: ["apps/api/**/*.test.ts"],
      rules: {
        "no-restricted-properties": "off",
      },
    },
  ],
});
