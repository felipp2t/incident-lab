import { randomUUID } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";
import type { CreateOrganizationUseCase } from "../../../domain/organization/application/use-cases/create-organization.js";
import { IdempotencyConflictError } from "../../../domain/organization/application/use-cases/errors/idempotency-conflict-error.js";
import { InvalidOrganizationNameError } from "../../../domain/organization/application/use-cases/errors/invalid-organization-name-error.js";
import { OrganizationMembershipExistsError } from "../../../domain/organization/application/use-cases/errors/organization-membership-exists-error.js";
import type { Database } from "../../db/drizzle/index.js";
import { requireActor } from "../middleware/require-actor.js";

interface CreateOrganizationBody {
  name: string;
}

export function createOrganizationController(db: Database, useCase: CreateOrganizationUseCase): FastifyPluginAsync {
  return async (app) => {
    app.post<{ Body: CreateOrganizationBody; Headers: { "idempotency-key": string; "x-correlation-id"?: string } }>(
      "/organizations",
      {
        preHandler: requireActor(db),
        schema: {
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
            required: ["name"],
            properties: { name: { type: "string", minLength: 1, maxLength: 120, pattern: "\\S" } }
          }
        }
      },
      async (request, reply) => {
        const result = await useCase.execute({
          actorId: request.actor.userId,
          sessionTokenHash: request.actor.sessionTokenHash,
          commandId: request.headers["idempotency-key"],
          correlationId: request.headers["x-correlation-id"] ?? randomUUID(),
          name: request.body.name
        });

        if (result.isLeft()) {
          const error = result.value;

          if (error instanceof IdempotencyConflictError) {
            return reply.code(409).send({ error: "idempotency_conflict" });
          }
          if (error instanceof InvalidOrganizationNameError) {
            return reply.code(400).send({ error: "invalid_organization_name" });
          }
          if (error instanceof OrganizationMembershipExistsError) {
            return reply.code(409).send({ error: "organization_membership_exists" });
          }

          return reply.code(500).send({ error: "internal_server_error" });
        }

        return reply.code(201).send(result.value);
      }
    );
  };
}
