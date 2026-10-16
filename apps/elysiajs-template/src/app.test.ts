process.env.DATABASE_URL ??= "postgres://user:pass@localhost:5432/sentinel_test";
process.env.JWT_SECRET ??= "test-secret-test-secret";

const { app } = await import("@/app");

import { describe, expect, it } from "bun:test";

describe("app", () => {
  it("GET / returns system status", async () => {
    const response = await app.handle(new Request("http://localhost/"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ name: "elysia-template", status: "ok" });
  });

  it("GET /api/v1/ping returns pong", async () => {
    const response = await app.handle(new Request("http://localhost/api/v1/ping"));

    expect(response.status).toBe(200);
    const body = (await response.json()) as { pong: boolean };
    expect(body.pong).toBe(true);
  });

  it("unknown route returns structured 404", async () => {
    const response = await app.handle(new Request("http://localhost/nope"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: "NOT_FOUND", message: "GET /nope not found" },
    });
  });
});
