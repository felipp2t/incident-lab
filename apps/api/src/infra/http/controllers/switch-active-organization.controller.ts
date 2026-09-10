import type { FastifyPluginAsync } from "fastify";
import { and, eq } from "drizzle-orm";
import type { Database } from "../../db/drizzle/index.js";
import { organizationMemberships, sessions } from "../../db/drizzle/schema.js";
import { requireActor } from "../middleware/require-actor.js";

interface SwitchActiveOrganizationBody {
  organizationId: string;
}

export function switchActiveOrganizationController(db: Database): FastifyPluginAsync {
  return async (app) => {
    app.patch<{ Body: SwitchActiveOrganizationBody }>(
      "/me/active-organization",
      {
        preHandler: requireActor(db),
        schema: {
          body: {
            type: "object",
            additionalProperties: false,
            required: ["organizationId"],
            properties: { organizationId: { type: "string", format: "uuid" } }
          }
        }
      },
      async (request, reply) => {
        const [membership] = await db
          .select({ role: organizationMemberships.role })
          .from(organizationMemberships)
          .where(
            and(
              eq(organizationMemberships.organizationId, request.body.organizationId),
              eq(organizationMemberships.userId, request.actor.userId)
            )
          )
          .limit(1);

        // The same response is used for an unknown organization and an organization
        // the actor does not belong to, preventing cross-organization enumeration.
        if (!membership) return reply.code(404).send({ error: "organization_not_found" });

        await db
          .update(sessions)
          .set({ activeOrganizationId: request.body.organizationId })
          .where(
            and(eq(sessions.tokenHash, request.actor.sessionTokenHash), eq(sessions.userId, request.actor.userId))
          );

        return {
          activeOrganizationId: request.body.organizationId,
          activeOrganizationRole: membership.role
        };
      }
    );
  };
}
