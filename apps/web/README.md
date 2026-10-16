# next-template

Next.js starter with an opinionated code-quality toolchain: oxlint + oxfmt + husky + Vitest, tuned for Feature-Sliced Design and Tailwind CSS.

## Quick start

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `bun run dev`          | Dev server (Turbopack, React Compiler)        |
| `bun run build`        | Production build                              |
| `bun run start`        | Serve the production build                    |
| `bun run lint`         | oxlint over the project (282 rules)           |
| `bun run lint:fix`     | oxlint with autofix                           |
| `bun run typecheck`    | `tsc --noEmit` — full-project type check      |
| `bun run format`       | Format everything with oxfmt (rewrites files) |
| `bun run format:check` | Check formatting without writing              |
| `bun run test`         | Run Vitest once                               |
| `bun run test:watch`   | Vitest in watch mode                          |

## Tech stack

- **Next.js 16.3** — App Router, Turbopack, `reactCompiler: true`
- **React 19.2** + **TypeScript 5.9** (`strict` + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`)
- **Tailwind CSS v4** — CSS-first config in the shared `@sentinel/ui` stylesheet
- **Bun** as the package manager and script runner

## Code quality toolchain

### Lint — oxlint (repo-root `oxlint.config.ts`)

- 282 rules: `correctness` as errors, `perf` and `suspicious` as warnings
- Plugins: `react`, `nextjs`, `typescript`, `import`, `jsx-a11y`, `unicorn`, `oxc`, `react-perf`, `promise`, `vitest`
- **Tailwind linting** via `eslint-plugin-tailwindcss` (contradicting classes, shorthands, arbitrary values)
- The Tailwind plugin runs through oxlint's `jsPlugins` — no ESLint installed
- Vendored shadcn code lives in `packages/ui` (`@sentinel/ui`); its `src/**` is ignored

### Format — oxfmt (repo-root `oxfmt.config.ts`)

- `printWidth: 100`
- Import sorting in perfectionist groups (`type` → builtin/external → internal → relative)
- Tailwind class sorting driven by the `@sentinel/ui` stylesheet (`clsx` / `cn` aware)
- `package.json` key sorting is on by default
- Wired into Zed via `format_on_save` with the `oxfmt` language server

### Git hooks — husky + lint-staged (`.husky/pre-commit`)

The repo-root hook runs `lint-staged` per workspace: `oxfmt --write` + `oxlint`
on staged JS/TS files, `oxfmt --write` on JSON/CSS/MD/YAML/TOML. Typecheck and
tests run in CI via `fullcheck`.

### Line endings — `.gitattributes`

All text files are LF in the repo and in the working copy; `*.png` / `*.ico` are binary. This keeps CRLF warnings away and keeps the shell hooks runnable regardless of a contributor's `core.autocrlf`.

## Project structure

```
src/
  app/            # Next.js App Router (routes, layout)
  shared/         # (planned) FSD layer: lib, config
  widgets/        # (planned)
  features/       # (planned)
  entities/       # (planned)
```

FSD layer directories appear as soon as the first real feature lands (no lint enforcement). Shared UI comes from `@sentinel/ui` (`packages/ui`): generated shadcn code excluded from linting/formatting.

## Testing — Vitest

- `vitest.config.ts` — `jsdom` environment, `@/*` → `src/*` alias, setup file
- `vitest.setup.ts` — jest-dom matchers + RTL cleanup after each test
- Tests are colocated: `src/**/*.{test,spec}.{ts,tsx}`
- The `vitest` oxlint plugin is enabled, so test files follow project lint rules

Example:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("renders the placeholder page without errors", () => {
    const { container } = render(<Home />);
    expect(container.innerHTML).toBe("");
  });
});
```

## AI tooling

- `AGENTS.md` at the repo root — agent rules, maintained by `next dev`
- Globally installed agent skills: React/Next.js best practices from Vercel (5 skills), FSD, Tailwind v4 design systems, shadcn, Vitest, Conventional Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Not configured yet

- CI/CD pipeline
- Environment variable validation
- oxlint type-aware linting (`oxlint-tsgolint`)
- E2E tests (Playwright)
