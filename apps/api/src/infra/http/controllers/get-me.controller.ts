import type { FastifyPluginAsync } from "fastify";
import type { Database } from "../../db/drizzle/index.js";
import { eq } from "drizzle-orm";
import { organizationMemberships, organizations } from "../../db/drizzle/schema.js";
import { requireActor } from "../middleware/require-actor.js";

export function getMeController(db: Database): FastifyPluginAsync {
  return async (app) => {
    app.get("/me", { preHandler: requireActor(db) }, async (request) => {
      const memberships = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          role: organizationMemberships.role
        })
        .from(organizationMemberships)
        .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
        .where(eq(organizationMemberships.userId, request.actor.userId));

      return {
        user: { id: request.actor.userId, email: request.actor.email, name: request.actor.name },
        activeOrganizationId: request.actor.activeOrganizationId,
        activeOrganizationRole: request.actor.activeOrganizationRole,
        organizations: memberships
      };
    });
  };
}
