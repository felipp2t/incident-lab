import cookie from "@fastify/cookie";
import Fastify from "fastify";
import { openDatabase } from "./infra/db/drizzle/index.js";
import { routes } from "./infra/http/routes.js";

export function buildApp(options: { databaseUrl: string; logger?: boolean }) {
  const app = Fastify({ logger: options.logger ?? false });
  const { db, pool } = openDatabase(options.databaseUrl);

  app.register(cookie);
  app.register(routes(db), { prefix: "/api" });

  app.get("/health", async () => ({ status: "ok" }));
  app.addHook("onClose", async () => pool.end());

  return app;
}
