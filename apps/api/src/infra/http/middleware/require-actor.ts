import type { FastifyReply, FastifyRequest } from "fastify";
import { and, eq, gt } from "drizzle-orm";
import { hashSessionToken, sessionCookie } from "../../auth/session.js";
import type { Database } from "../../db/drizzle/index.js";
import { organizationMemberships, sessions, users } from "../../db/drizzle/schema.js";

export type OrganizationRole = "admin" | "respondente" | "visualizador";

export interface Actor {
  userId: string;
  email: string;
  name: string;
  activeOrganizationId: string | null;
  activeOrganizationRole: OrganizationRole | null;
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
        sessionActiveOrganizationId: sessions.activeOrganizationId,
        membershipOrganizationId: organizationMemberships.organizationId,
        activeOrganizationRole: organizationMemberships.role
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .leftJoin(
        organizationMemberships,
        and(
          eq(organizationMemberships.userId, users.id),
          eq(organizationMemberships.organizationId, sessions.activeOrganizationId)
        )
      )
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!actor) return reply.code(401).send({ error: "authentication_required" });

    // A stale or forged active-organization reference is not an active context.
    // Keep the session authenticated, but never grant a role without this user's membership.
    request.actor = {
      userId: actor.userId,
      email: actor.email,
      name: actor.name,
      activeOrganizationId: actor.membershipOrganizationId ?? null,
      activeOrganizationRole: actor.activeOrganizationRole ?? null,
      sessionTokenHash: tokenHash
    };
  };
}

export function requireOrganizationRole(db: Database, roles: readonly OrganizationRole[]) {
  const authenticate = requireActor(db);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (
      !request.actor.activeOrganizationId ||
      !request.actor.activeOrganizationRole ||
      !roles.includes(request.actor.activeOrganizationRole)
    ) {
      return reply.code(403).send({ error: "forbidden" });
    }
  };
}
