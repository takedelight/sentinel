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
| `bun run lint`         | oxlint over the project (286 rules)           |
| `bun run lint:fix`     | oxlint with autofix                           |
| `bun run typecheck`    | `tsc --noEmit` — full-project type check      |
| `bun run format`       | Format everything with oxfmt (rewrites files) |
| `bun run format:check` | Check formatting without writing              |
| `bun run test`         | Run Vitest once                               |
| `bun run test:watch`   | Vitest in watch mode                          |

## Tech stack

- **Next.js 16.3** — App Router, Turbopack, `reactCompiler: true`
- **React 19.2** + **TypeScript 5.9** (`strict` + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`)
- **Tailwind CSS v4** — CSS-first config in `src/app/globals.css`
- **Bun** as the package manager and script runner

## Code quality toolchain

### Lint — oxlint (`oxlint.config.ts`)

- 286 rules: `correctness` as errors, `perf` and `suspicious` as warnings
- Plugins: `react`, `nextjs`, `typescript`, `import`, `jsx-a11y`, `unicorn`, `oxc`, `react-perf`, `promise`, `vitest`
- **FSD linting** via `eslint-plugin-fsd-lint` (import rules between layers, public API, UI in business logic)
- **Tailwind linting** via `eslint-plugin-tailwindcss` (contradicting classes, shorthands, arbitrary values)
- Both rule sets run through oxlint's `jsPlugins` — no ESLint installed
- Generated shadcn code is ignored: `src/shared/ui/**`

### Format — oxfmt (`oxfmt.config.ts`)

- `printWidth: 100`
- Import sorting in perfectionist groups (`type` → builtin/external → internal → relative)
- Tailwind class sorting driven by `globals.css` (`clsx` / `cn` aware)
- `package.json` key sorting is on by default
- Wired into Zed via `format_on_save` with the `oxfmt` language server

### Git hooks — husky + lint-staged (`.husky/pre-commit`)

Every commit runs, in order:

1. `lint-staged` — `oxfmt --write` + `oxlint` on staged JS/TS files, `oxfmt --write` on JSON/CSS/MD/YAML/TOML
2. `bun run typecheck` — `tsc --noEmit` over the whole project

Type checking runs from the hook, not from lint-staged, because lint-staged appends file paths to commands and `tsc` ignores `tsconfig.json` when files are passed explicitly.

### Line endings — `.gitattributes`

All text files are LF in the repo and in the working copy; `*.png` / `*.ico` are binary. This keeps CRLF warnings away and keeps the shell hooks runnable regardless of a contributor's `core.autocrlf`.

## Project structure

```
src/
  app/            # Next.js App Router (routes, layout, global styles)
  shared/         # (planned) FSD layer: ui, lib, config — shadcn lives here
  widgets/        # (planned)
  features/       # (planned)
  entities/       # (planned)
```

The FSD layers are enforced by `fsd/*` rules today; the directories appear as soon as the first real feature lands. `src/shared/ui/**` is excluded from linting/formatting because it holds generated shadcn code.

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
- shadcn `components.json`
- Environment variable validation
- oxlint type-aware linting (`oxlint-tsgolint`)
- E2E tests (Playwright)
