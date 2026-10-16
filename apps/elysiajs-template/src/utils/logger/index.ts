import { Elysia } from "elysia";
import { buildErrorResponse } from "@/utils/errors";

const startedAt = new WeakMap<Request, number>();

const formatLine = (request: Request, status: number, extra?: string): string => {
  const start = startedAt.get(request);
  const duration = start === undefined ? "?" : String(Math.round(performance.now() - start));
  const path = new URL(request.url).pathname;
  const time = new Date().toISOString().slice(11, 19);
  return `[${time}] ${request.method} ${path} ${status} ${duration}ms${extra ? ` ${extra}` : ""}`;
};

export const logger = new Elysia({ name: "logger" })
  .onRequest(({ request }) => {
    startedAt.set(request, performance.now());
  })
  .onAfterHandle(({ request, set }) => {
    const status = typeof set.status === "number" ? set.status : 200;
    console.log(formatLine(request, status));
  })
  .onError(({ request, code, error }) => {
    const { status, body } = buildErrorResponse(code, error);
    const message = body.error.message.split("\n")[0]?.slice(0, 200);
    console.error(formatLine(request, status, `code=${String(code)} error=${message}`));
  })
  .as("global");
