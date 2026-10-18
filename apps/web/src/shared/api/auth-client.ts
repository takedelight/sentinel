import { createAuthClient } from "@sentinel/auth/client";

/**
 * Shared Better Auth client for the web app. Talks to the API auth
 * endpoints (`/api/auth/*`) — see `@sentinel/auth/server`.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7000",
});
