import { defineConfig } from "oxlint";

export default defineConfig({
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
  categories: {
    correctness: "error",
    perf: "warn",
    suspicious: "warn",
  },
  env: {
    builtin: true,
    browser: true,
  },
  jsPlugins: [
    { name: "fsd", specifier: "eslint-plugin-fsd-lint" },
    { name: "tailwindcss", specifier: "eslint-plugin-tailwindcss" },
  ],
  settings: {
    react: {
      version: "19.2",
    },
    tailwindcss: {
      cssConfigPath: "./src/app/globals.css",
    },
  },
  ignorePatterns: ["src/shared/ui/**"],
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

    /* === FEATURE-SLICED DESIGN (jsPlugins: eslint-plugin-fsd-lint) === */
    "fsd/forbidden-imports": [
      "error",
      { rootPath: "/src/", alias: { value: "@", withSlash: true } },
    ],
    "fsd/no-cross-slice-dependency": [
      "error",
      { rootPath: "/src/", alias: { value: "@", withSlash: true } },
    ],
    "fsd/no-public-api-sidestep": "error",
    // В v1.2.1 правило сравнивает имя слоя с ["model","api","lib"],
    // поэтому задаём слои явно; "^\\./" — публичный API (index.ts) сам
    // импортирует ./ui/*, это легитимно
    "fsd/no-ui-in-business-logic": [
      "warn",
      {
        rootPath: "/src/",
        alias: { value: "@", withSlash: true },
        businessLogicLayers: ["entities", "shared", "features", "widgets"],
        // "features" не включаем: импорты через /features/* уже
        // перехватывает fsd/forbidden-imports
        uiLayers: ["ui", "widgets"],
        ignoreImportPatterns: ["^\\./"],
      },
    ],

    /* === TAILWIND CSS (jsPlugins: eslint-plugin-tailwindcss) === */
    "tailwindcss/no-contradicting-classname": "error",
    "tailwindcss/important-modifier-suffix": "warn",
    "tailwindcss/enforces-shorthand": "warn",
    "tailwindcss/enforces-negative-arbitrary-values": "warn",
    "tailwindcss/no-arbitrary-value": "warn",
  },
});
