import { defineConfig } from "drizzle-kit";
import { env } from "./src/utils/env/index";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/utils/database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
