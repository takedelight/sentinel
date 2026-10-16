import { env } from "@/utils/env";
import { app } from "@/app";

app.listen(env.PORT);

console.log(`🦊 Elysia is running at http://localhost:${env.PORT} [${env.NODE_ENV}]`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    app.stop();
    process.exit(0);
  });
}
