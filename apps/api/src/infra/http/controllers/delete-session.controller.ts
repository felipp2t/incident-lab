import type { FastifyPluginAsync } from "fastify";
import { eq } from "drizzle-orm";
import { sessionCookie } from "../../auth/session.js";
import type { Database } from "../../db/drizzle/index.js";
import { sessions } from "../../db/drizzle/schema.js";
import { requireActor } from "../middleware/require-actor.js";

export function deleteSessionController(db: Database): FastifyPluginAsync {
  return async (app) => {
    app.delete("/session", { preHandler: requireActor(db) }, async (request, reply) => {
      await db.delete(sessions).where(eq(sessions.tokenHash, request.actor.sessionTokenHash));
      reply.clearCookie(sessionCookie, { path: "/" });
      return reply.code(204).send();
    });
  };
}
