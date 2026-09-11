import { createHash } from "node:crypto";
import type { BaseError } from "../../../../core/errors/base-error.js";
import { type Either, left, right } from "../../../../core/types/either.js";
import { MonitoredService } from "../../enterprise/entities/monitored-service.js";
import type {
  MonitoredServiceRegistrationRepository,
  MonitoredServiceRegistrationResult
} from "../repositories/monitored-service-registration-repository.js";
import { IdempotencyConflictError } from "./errors/idempotency-conflict-error.js";
import { InvalidMonitoredServiceNameError } from "./errors/invalid-monitored-service-name-error.js";
import { ForbiddenError } from "./errors/forbidden-error.js";

export interface MonitoredServiceCreation {
  id: string;
  organizationId: string;
  name: string;
  active: boolean;
  operationalState: MonitoredService["operationalState"];
  createdAt: string;
}

export type CreateMonitoredServiceResponse = Either<BaseError, MonitoredServiceCreation>;

export class CreateMonitoredServiceUseCase {
  constructor(private readonly repository: MonitoredServiceRegistrationRepository) {}

  async execute(input: {
    actorId: string;
    organizationId: string;
    commandId: string;
    correlationId: string;
    name: string;
    now?: Date;
  }): Promise<CreateMonitoredServiceResponse> {
    const name = MonitoredService.normalizeName(input.name);
    if (!name) return left(new InvalidMonitoredServiceNameError());

    const now = input.now ?? new Date();
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ organizationId: input.organizationId, name }))
      .digest("hex");
    const service = MonitoredService.create({
      organizationId: input.organizationId,
      name,
      createdAt: now
    });

    const result = await this.repository.register({
      organizationId: input.organizationId,
      service,
      actorId: input.actorId,
      commandId: input.commandId,
      correlationId: input.correlationId,
      requestHash
    });

    if (result.kind === "conflict") return left(new IdempotencyConflictError());
    if (result.kind === "forbidden") return left(new ForbiddenError());
    if (result.kind !== "created" && result.kind !== "replayed") {
      return left(new Error("unexpected_monitored_service_registration_result"));
    }
    return right(toResponse(result));
  }
}

function toResponse(result: Extract<MonitoredServiceRegistrationResult, { value: unknown }>): MonitoredServiceCreation {
  return {
    id: result.value.id.toString(),
    organizationId: result.value.organizationId,
    name: result.value.name,
    active: result.value.active,
    operationalState: result.value.operationalState,
    createdAt: result.value.createdAt.toISOString()
  };
}
