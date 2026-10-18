import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";

export interface AuthOptions {
  /** Drizzle instance from the host app (e.g. `drizzle(env.DATABASE_URL)`). */
  db: DB;
  /** Drizzle schema record containing the auth tables (`user`, `session`, ...). */
  schema: Record<string, unknown>;
  /** Public URL the auth server is reachable at (e.g. `http://localhost:7000`). */
  baseURL: string;
  /** Origins allowed to call the auth endpoints (e.g. the web app URL). */
  trustedOrigins: string[];
  /** Prefix for all auth cookies (e.g. `sentinel`). */
  cookiePrefix: string;
  github: {
    clientId: string;
    clientSecret: string;
  };
}

export function createAuth(options: AuthOptions) {
  return betterAuth({
    database: drizzleAdapter(options.db, {
      provider: "pg",
      schema: options.schema,
    }),
    baseURL: options.baseURL,
    trustedOrigins: options.trustedOrigins,
    socialProviders: {
      github: {
        clientId: options.github.clientId,
        clientSecret: options.github.clientSecret,
      },
    },
    advanced: {
      cookiePrefix: options.cookiePrefix,
    },
    plugins: [
      dash(),
      jwt({
        jwt: {
          expirationTime: "15m",
          defineCookie: {
            name: "access_token",
            attributes: {
              httpOnly: true,
              secure: false,
              sameSite: "none",
              path: "/",
              maxAge: 15 * 60,
            },
          },
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
