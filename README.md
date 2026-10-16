# sentinel

Monorepo for the sentinel project: Bun workspaces + Turborepo (JS/TS) and
`go.work` (Go), with a single CI pipeline.

## Structure

| Path                | Package              | Description                               |
| ------------------- | -------------------- | ----------------------------------------- |
| `apps/web`          | `@sentinel/web`      | Next.js 16 web app (React 19, Tailwind 4) |
| `apps/api`          | `@sentinel/api`      | Elysia API (Drizzle ORM, PostgreSQL)      |
| `apps/agent`        | `@sentinel/agent`    | Go agent (workspace via `go.work`)        |
| `packages/tsconfig` | `@sentinel/tsconfig` | Shared TypeScript configs                 |

## Quick start

```sh
bun install     # single lockfile for all workspaces
bun run dev     # start everything (turbo)
bun run build   # build everything
```

## Commands

| Command                | What it runs                                           |
| ---------------------- | ------------------------------------------------------ |
| `bun run dev`          | `turbo run dev` — all dev servers                      |
| `bun run build`        | `turbo run build` — `next build`, `go build`           |
| `bun run lint`         | `turbo run lint` — oxlint per workspace                |
| `bun run typecheck`    | `turbo run typecheck` — `next typegen` + `tsc`         |
| `bun run test`         | `turbo run test` — Vitest + `bun test`                 |
| `bun run format`       | `turbo run format` — oxfmt                             |
| `bun run format:check` | oxfmt check                                            |
| `bun run fullcheck`    | lint + format check + typecheck + test in one run (CI) |

Go checks (from the root; plain `./...` does not work in workspace mode):

```sh
go vet ./apps/agent/... && go test ./apps/agent/...
```

## Tooling

- **Package manager:** Bun (`packageManager: bun@1.4.2`)
- **Task runner:** Turborepo (`turbo.json`), local cache in `.turbo/`
- **Dev infra:** root `docker-compose.yaml` (Postgres + MinIO for the API) —
  `docker compose up -d`
- **Lint/format:** oxlint + oxfmt (root configs with per-app `overrides`)
- **Git hooks:** husky + lint-staged at the repo root (format + lint on commit;
  typecheck and tests run in CI)
- **CI:** GitHub Actions (`.github/workflows/ci.yml`)

Agent-facing instructions live in [AGENTS.md](./AGENTS.md).
