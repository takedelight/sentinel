# Elysia + Bun template

Шаблон сервера на [Elysia](https://elysiajs.com) с Bun, Postgres (Drizzle ORM), MinIO,
валидацией env, линтингом, форматированием и тестами.

## Быстрый старт

```bash
bun install
cp .env.example .env        # Windows (PowerShell): Copy-Item .env.example .env
docker compose up -d        # postgres + minio
bun run db:migrate          # применить миграции
bun run dev                 # http://localhost:3000
```

Не забудьте заменить `JWT_SECRET` в `.env` (минимум 16 символов).

## Команды

| команда               | что делает                                |
| --------------------- | ----------------------------------------- |
| `bun run dev`         | дев-сервер с `--watch`                    |
| `bun run start`       | запуск без watch                          |
| `bun run lint`        | oxlint                                    |
| `bun run lint:fix`    | oxlint с автоисправлениями                |
| `bun run fmt`         | oxfmt — форматирование                    |
| `bun run fmt:check`   | oxfmt --check (для CI)                    |
| `bun run typecheck`   | `tsc --noEmit`                            |
| `bun test`            | тесты (bun test)                          |
| `bun run db:generate` | сгенерировать миграцию из изменений схемы |
| `bun run db:migrate`  | применить миграции                        |
| `bun run db:studio`   | drizzle-studio (GUI по данным)            |

## API

| маршрут                      | ответ                                                                 |
| ---------------------------- | --------------------------------------------------------------------- |
| `GET /`                      | `{ name, status }`                                                    |
| `GET /health`                | `{ status, database, uptime, latencyMs }`, **503** если БД недоступна |
| `GET /api/v1/ping`           | `{ pong, time }`                                                      |
| `GET /api/v1/hello?name=...` | `{ hello }`, без параметра — `world`                                  |

Ошибки — единый формат:

```json
{ "error": { "code": "NOT_FOUND", "message": "GET /nope not found" } }
```

Новый модуль — папка `src/modules/<name>/index.ts` с Elysia-контроллером (при
необходимости `service.ts` для бизнес-логики и `model.ts` для Typebox-схем),
подключите его в `src/app.ts` через `.use()`. Путь `/api/v1/...` объявляйте
внутри контроллера через `.group("/api/v1", ...)`.

## Структура

```
src/
├── main.ts                # точка входа: listen + graceful shutdown
├── app.ts                 # Elysia-инстанс без listen — собирает модули
├── modules/
│   ├── system/index.ts    # контроллер: GET / и группа /api/v1
│   └── health/index.ts    # контроллер: GET /health
└── utils/
    ├── env/index.ts       # zod-схема env, приложение падает при невалидном env
    ├── database/index.ts  # drizzle-подключение
    ├── database/schema.ts # таблицы drizzle
    ├── errors/index.ts    # единый формат ошибок
    └── logger/index.ts    # логгер запросов
drizzle/                   # сгенерированные миграции
drizzle.config.ts
docker-compose.yaml        # postgres + minio
```

## Переменные окружения

Скопируйте `.env.example` → `.env`. Схема в `src/utils/env/index.ts` проверяет
`NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET` при старте и завершает процесс при ошибке.

Оксилинт запрещает обращения к `Bun.env`/`process.env` вне этой схемы — берите env только
через `import { env } from "@/utils/env"`.

## База данных

1. Опишите таблицы в `src/utils/database/schema.ts`
2. `bun run db:generate` — создать SQL-миграцию в `drizzle/`
3. `bun run db:migrate` — применить

Подключение — `src/utils/database/index.ts`, URL берётся из env-схемы.

## Docker

`docker compose up -d` поднимает:

- **postgres** — переменные `DATABASE_USER/PASSWORD/NAME/PORT` с дефолтами,
  совпадающими с `DATABASE_URL` из `.env.example`
- **minio** + **minio-init** — создаёт бакет `STORAGE_BUCKET_NAME` и правило
  автоочистки для `temp/`

## Инструменты

- **oxlint** — линтер; отдельно настроены баны: прямой доступ к `env` и non-null assertion (`!`)
- **oxfmt** — форматтер (`.oxfmtrc.json`)
- **drizzle-kit** — миграции
- **GitHub Actions** — на каждый push/PR: lint → fmt:check → typecheck → test
