import type { FastifyReply, FastifyRequest } from "fastify";
import { and, eq, gt } from "drizzle-orm";
import { hashSessionToken, sessionCookie } from "../../auth/session.js";
import type { Database } from "../../db/drizzle/index.js";
import { sessions, users } from "../../db/drizzle/schema.js";

export interface Actor {
  userId: string;
  email: string;
  name: string;
  activeOrganizationId: string | null;
  sessionTokenHash: string;
}

declare module "fastify" {
  interface FastifyRequest {
    actor: Actor;
  }
}

export function requireActor(db: Database) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies[sessionCookie];
    if (!token) return reply.code(401).send({ error: "authentication_required" });

    const tokenHash = hashSessionToken(token);
    const [actor] = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        activeOrganizationId: sessions.activeOrganizationId
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!actor) return reply.code(401).send({ error: "authentication_required" });
    request.actor = { ...actor, sessionTokenHash: tokenHash };
  };
}
