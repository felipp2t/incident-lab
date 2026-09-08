import type { FastifyPluginAsync } from "fastify";
import type { Database } from "../../db/drizzle/index.js";
import { requireActor } from "../middleware/require-actor.js";

export function getMeController(db: Database): FastifyPluginAsync {
  return async (app) => {
    app.get("/me", { preHandler: requireActor(db) }, async (request) => ({
      user: { id: request.actor.userId, email: request.actor.email, name: request.actor.name },
      activeOrganizationId: request.actor.activeOrganizationId
    }));
  };
}
