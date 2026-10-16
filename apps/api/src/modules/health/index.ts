import { Elysia } from "elysia";
import { sql } from "drizzle-orm";
import { db } from "@/utils/database";

export const health = new Elysia({ name: "health" }).get("/health", async ({ set }) => {
  const startedAt = performance.now();
  let database: "up" | "down" = "down";

  try {
    await db.execute(sql`select 1`);
    database = "up";
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.error(`[health] database check failed: ${reason}`);
  }

  set.status = database === "up" ? 200 : 503;

  return {
    status: database === "up" ? "ok" : "degraded",
    database,
    uptime: Math.round(process.uptime()),
    latencyMs: Math.round(performance.now() - startedAt),
  };
});
