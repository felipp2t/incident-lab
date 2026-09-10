import type { FastifyPluginAsync } from "fastify";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { AssociateOrganizationMemberUseCase } from "../../../domain/organization/application/use-cases/associate-organization-member.js";
import type { BaseError } from "../../../core/errors/base-error.js";
import type { Database } from "../../db/drizzle/index.js";
import { organizations } from "../../db/drizzle/schema.js";
import { requireOrganizationRole } from "../middleware/require-actor.js";

type AssociateRole = "respondente" | "visualizador";

interface AssociateMemberBody {
  userId: string;
  role: AssociateRole;
}

interface OrganizationParams {
  organizationId: string;
}

interface CommandHeaders {
  "idempotency-key": string;
  "x-correlation-id"?: string;
}

function errorResponse(error: BaseError) {
  switch (error.constructor.name) {
    case "OrganizationNotFoundError":
      return { status: 404, body: { error: "organization_not_found" } };
    case "UserNotFoundError":
      return { status: 404, body: { error: "user_not_found" } };
    case "IdempotencyConflictError":
      return { status: 409, body: { error: "idempotency_conflict" } };
    case "OrganizationMembershipExistsError":
      return { status: 409, body: { error: "organization_membership_exists" } };
    case "InvalidMembershipRoleError":
      return { status: 400, body: { error: "invalid_membership_role" } };
    case "ForbiddenError":
    case "UnauthorizedError":
      return { status: 403, body: { error: "forbidden" } };
    default:
      return { status: 500, body: { error: "internal_server_error" } };
  }
}

export function associateOrganizationMemberController(
  db: Database,
  useCase: AssociateOrganizationMemberUseCase
): FastifyPluginAsync {
  return async (app) => {
    app.post<{ Params: OrganizationParams; Body: AssociateMemberBody; Headers: CommandHeaders }>(
      "/organizations/:organizationId/members",
      {
        preHandler: requireOrganizationRole(db, ["admin"]),
        schema: {
          params: {
            type: "object",
            required: ["organizationId"],
            properties: { organizationId: { type: "string", format: "uuid" } }
          },
          headers: {
            type: "object",
            required: ["idempotency-key"],
            properties: {
              "idempotency-key": { type: "string", minLength: 1, maxLength: 200, pattern: "\\S" },
              "x-correlation-id": { type: "string", format: "uuid" }
            }
          },
          body: {
            type: "object",
            additionalProperties: false,
            required: ["userId", "role"],
            properties: {
              userId: { type: "string", format: "uuid" },
              role: { type: "string", enum: ["respondente", "visualizador"] }
            }
          }
        }
      },
      async (request, reply) => {
        // The active context is authoritative. A path targeting another organization
        // is deliberately indistinguishable from an unknown organization.
        if (request.actor.activeOrganizationId !== request.params.organizationId) {
          return reply.code(404).send({ error: "not_found" });
        }

        const [organization] = await db
          .select({ id: organizations.id })
          .from(organizations)
          .where(eq(organizations.id, request.params.organizationId))
          .limit(1);
        if (!organization) return reply.code(404).send({ error: "not_found" });

        const result = await useCase.execute({
          actorId: request.actor.userId,
          organizationId: request.params.organizationId,
          userId: request.body.userId,
          role: request.body.role,
          commandId: request.headers["idempotency-key"],
          correlationId: request.headers["x-correlation-id"] ?? randomUUID()
        });

        if (result.isLeft()) {
          const response = errorResponse(result.value);
          return reply.code(response.status).send(response.body);
        }

        return reply.code(201).send(result.value);
      }
    );
  };
}
