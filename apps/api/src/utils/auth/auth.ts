import { createAuth } from "@sentinel/auth/server";
import { env } from "@/utils/env";
import { db } from "../database";
import { authTables } from "../database/schema";

export const auth = createAuth({
  db,
  schema: authTables,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN],
  cookiePrefix: env.COOKIE_PREFIX,
  github: {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  },
});
