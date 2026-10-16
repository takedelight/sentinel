import { Elysia, t } from "elysia";

export const system = new Elysia({ name: "system" })
  .get("/", () => ({ name: "elysia-template", status: "ok" }))
  .group("/api/v1", (api) =>
    api
      .get("/ping", () => ({ pong: true, time: new Date().toISOString() }))
      .get("/hello", ({ query }) => ({ hello: query.name ?? "world" }), {
        query: t.Object({
          name: t.Optional(t.String({ minLength: 1 })),
        }),
      }),
  );
