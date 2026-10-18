import { createAuthClient as createBetterAuthClient } from "better-auth/client";

export interface AuthClientOptions {
  /** Base URL of the auth server (e.g. `http://localhost:7000`). */
  baseURL: string;
}

export function createAuthClient(options: AuthClientOptions) {
  return createBetterAuthClient({
    baseURL: options.baseURL,
    credentials: "include",
  });
}

export type AuthClient = ReturnType<typeof createAuthClient>;
