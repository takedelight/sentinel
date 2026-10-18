import { env } from "@/utils/env";
import { app } from "@/app";

app.listen(env.APP_PORT);

console.log(`🦊 Elysia is running at http://localhost:${env.APP_PORT} [${env.NODE_ENV}]`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    app.stop();
    process.exit(0);
  });
}
