# sentinel — instructions for AI agents

Monorepo: Bun workspaces + Turborepo for JS/TS, `go.work` for Go, CI in GitHub
Actions. Package manager is **Bun** — never run npm/pnpm/yarn here.

## Layout

| Path          | Package           | Stack                                                   |
| ------------- | ----------------- | ------------------------------------------------------- |
| `apps/web`    | `@sentinel/web`   | Next.js 16 (App Router), React 19, Tailwind 4, Vitest   |
| `apps/api`    | `@sentinel/api`   | Elysia, Drizzle ORM (PostgreSQL), Zod, `bun test`       |
| `apps/agent`  | `@sentinel/agent` | Go module (workspace via `go.work`, `cmd/agent` binary) |
| `packages/ui` | `@sentinel/ui`    | shadcn/ui components (React 19, Base UI, Tailwind 4)    |

Directory names differ from package names — always match on the `name` field in
`package.json`.

## Commands (run from the repo root)

```sh
bun install                # one lockfile for all workspaces
bun run dev                # turbo run dev (all dev servers)
bun run build              # next build + go build
bun run lint               # oxlint per workspace
bun run typecheck          # next typegen && tsc / tsc per workspace
bun run test               # vitest (web) + bun test (api)
bun run format             # oxfmt
bun run format:check       # oxfmt --check
bun run fullcheck          # lint + format:check + typecheck + test (CI runs this)
```

Go (from the root, `./...` does not work in workspace mode):

```sh
go vet ./apps/agent/... && go test ./apps/agent/...
```

## Conventions

- Packages are scoped `@sentinel/*`; new apps go in `apps/`, shared code in
  `packages/` (already covered by `workspaces`).
- Commits follow Conventional Commits.
- Pre-commit hook runs `lint-staged` per workspace (format + lint of staged
  files). Typecheck and tests are CI's job — do not run them on commit.
- Lint/format configs live at the repo root (`oxlint.config.ts`,
  `oxfmt.config.ts`); app differences go through per-app `overrides`.
- UI components live in `packages/ui` (`@sentinel/ui`, shadcn `base-nova`
  preset) and are consumed by `apps/web` via `@sentinel/ui/*` subpath imports
  (`transpilePackages`); add them from `packages/ui` with
  `bunx --bun shadcn@latest add <name>`. Vendored source under
  `packages/ui/src/**` is ignored by oxlint/oxfmt; `typecheck` still covers it.
- In `@sentinel/api`, `process.env` is read only through `src/utils/env`
  (enforced by oxlint; tests may stub env before importing the app).
- `.env` lives at the repo root, never commit it; bun does not search parent
  directories, so API runtime scripts read it via `--env-file=../../.env`.
  Shared TS config lives in `@sentinel/tsconfig`; apps keep only their own
  options in `tsconfig.json`.
- Dev infra (Postgres + MinIO for the API) is the root `docker-compose.yaml`;
  start it with `docker compose up -d` from the root.

## Next.js (@sentinel/web)

**This is NOT the Next.js you know.** APIs, conventions and file structure may
differ from your training data. Read the bundled, version-matched docs at
`apps/web/node_modules/next/dist/docs/` before writing any code.
Heed deprecation notices.

Next's auto-generation of app-level `AGENTS.md` is deliberately disabled
(`agentRules: false` in `apps/web/next.config.ts`) — this root file
replaces it. Do not remove that option and do not recreate
`apps/web/AGENTS.md`; `next dev` would fight you over it.

## CI

`.github/workflows/ci.yml` runs on push to `main` and on PRs:

- JS: `bun install --frozen-lockfile` → `fullcheck` (lint + format + typecheck + test)
- Go: `go vet` + `go test` (only when `apps/agent` contains `*.go` files)
