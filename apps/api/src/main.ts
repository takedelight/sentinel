import { Elysia } from "elysia";
import { buildErrorResponse } from "@/utils/errors";
import { logger } from "@/utils/logger";

import { env } from "@/utils/env";
import { auth } from "@/utils/auth";
import cors from "@elysiajs/cors";

export const app = new Elysia({ name: "app" })
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  )
  .use(logger)
  .onError(({ request, code, error, set }) => {
    const response = buildErrorResponse(code, error);
    set.status = response.status;

    if (code === "NOT_FOUND") {
      const { pathname } = new URL(request.url);
      response.body.error.message = `${request.method} ${pathname} not found`;
    }

    return response.body;
  })
  .mount(auth.handler)
  .listen(env.APP_PORT);

console.log(`🦊 Elysia is running at http://localhost:${env.APP_PORT} [${env.NODE_ENV}]`);
