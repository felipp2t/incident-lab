import { randomUUID } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";
import type { CreateMonitoredServiceUseCase } from "../../../domain/monitoring/application/use-cases/create-monitored-service.js";
import { ForbiddenError } from "../../../domain/monitoring/application/use-cases/errors/forbidden-error.js";
import { IdempotencyConflictError } from "../../../domain/monitoring/application/use-cases/errors/idempotency-conflict-error.js";
import { InvalidMonitoredServiceNameError } from "../../../domain/monitoring/application/use-cases/errors/invalid-monitored-service-name-error.js";
import type { Database } from "../../db/drizzle/index.js";
import { requireOrganizationRole } from "../middleware/require-actor.js";

interface CreateMonitoredServiceBody {
  name: string;
}

interface OrganizationParams {
  organizationId: string;
}

interface CommandHeaders {
  "idempotency-key": string;
  "x-correlation-id"?: string;
}

export function createMonitoredServiceController(
  db: Database,
  useCase: CreateMonitoredServiceUseCase
): FastifyPluginAsync {
  return async (app) => {
    app.post<{
      Params: OrganizationParams;
      Body: CreateMonitoredServiceBody;
      Headers: CommandHeaders;
    }>(
      "/organizations/:organizationId/services",
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
            required: ["name"],
            properties: {
              name: { type: "string", minLength: 1, maxLength: 120, pattern: "\\S" }
            }
          }
        }
      },
      async (request, reply) => {
        if (request.actor.activeOrganizationId !== request.params.organizationId) {
          return reply.code(404).send({ error: "not_found" });
        }

        const result = await useCase.execute({
          actorId: request.actor.userId,
          organizationId: request.params.organizationId,
          commandId: request.headers["idempotency-key"],
          correlationId: request.headers["x-correlation-id"] ?? randomUUID(),
          name: request.body.name
        });

        if (result.isLeft()) {
          if (result.value instanceof IdempotencyConflictError) {
            return reply.code(409).send({ error: "idempotency_conflict" });
          }
          if (result.value instanceof InvalidMonitoredServiceNameError) {
            return reply.code(400).send({ error: "invalid_monitored_service_name" });
          }
          if (result.value instanceof ForbiddenError) {
            return reply.code(403).send({ error: "forbidden" });
          }

          return reply.code(500).send({ error: "internal_server_error" });
        }

        return reply.code(201).send(result.value);
      }
    );
  };
}
