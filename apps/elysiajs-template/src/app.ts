import { Elysia } from "elysia";
import { system } from "@/modules/system";
import { health } from "@/modules/health";
import { buildErrorResponse } from "@/utils/errors";
import { logger } from "@/utils/logger";

export const app = new Elysia({ name: "app" })
  .use(logger)
  .use([health, system])
  .onError(({ request, code, error, set }) => {
    const response = buildErrorResponse(code, error);
    set.status = response.status;

    if (code === "NOT_FOUND") {
      const { pathname } = new URL(request.url);
      response.body.error.message = `${request.method} ${pathname} not found`;
    }

    return response.body;
  });
