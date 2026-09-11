import { createHash } from "node:crypto";
import type { BaseError } from "../../../../core/errors/base-error.js";
import { left, right, type Either } from "../../../../core/types/either.js";
import { Incident, type IncidentOperationalImpact, type IncidentSeverity } from "../../enterprise/entities/incident.js";
import type { ManualIncidentRegistrationRepository, ManualIncidentRegistrationResult } from "../repositories/manual-incident-registration-repository.js";

export class InvalidManualIncidentInputError extends Error {}
export class ManualIncidentIdempotencyConflictError extends Error {}
export class ManualIncidentForbiddenError extends Error {}
export class ManualIncidentServiceNotFoundError extends Error {}
export class ManualIncidentServiceInactiveError extends Error {}

export interface OpenManualIncidentResponse {
  id: string;
  organizationId: string;
  serviceId: string;
  origin: "manual";
  state: "open";
  severity: IncidentSeverity;
  operationalImpact: IncidentOperationalImpact;
  visibility: "private";
  version: number;
  openedAt: string;
  openedBy: string;
}

export class OpenManualIncidentUseCase {
  constructor(private readonly repository: ManualIncidentRegistrationRepository) {}

  async execute(input: {
    actorId: string; organizationId: string; serviceId: string; commandId: string; correlationId: string;
    severity: IncidentSeverity; operationalImpact: IncidentOperationalImpact; now?: Date;
  }): Promise<Either<BaseError, OpenManualIncidentResponse>> {
    if (!["low", "medium", "high", "critical"].includes(input.severity) ||
        !["none", "unknown", "degraded", "unavailable"].includes(input.operationalImpact)) {
      return left(new InvalidManualIncidentInputError());
    }
    const openedAt = input.now ?? new Date();
    const requestHash = createHash("sha256").update(JSON.stringify({
      organizationId: input.organizationId, serviceId: input.serviceId,
      severity: input.severity, operationalImpact: input.operationalImpact
    })).digest("hex");
    const incident = Incident.create({
      organizationId: input.organizationId, serviceId: input.serviceId,
      severity: input.severity, operationalImpact: input.operationalImpact,
      openedAt, openedBy: input.actorId
    });
    const result = await this.repository.register({ ...input, incident, requestHash });
    if (result.kind === "conflict") return left(new ManualIncidentIdempotencyConflictError());
    if (result.kind === "forbidden") return left(new ManualIncidentForbiddenError());
    if (result.kind === "service_not_found") return left(new ManualIncidentServiceNotFoundError());
    if (result.kind === "service_inactive") return left(new ManualIncidentServiceInactiveError());
    if (result.kind !== "created" && result.kind !== "replayed") return left(new Error("unexpected_manual_incident_registration_result"));
    return right(toResponse(result));
  }
}

function toResponse(result: Extract<ManualIncidentRegistrationResult, { value: unknown }>): OpenManualIncidentResponse {
  const incident = result.value;
  return { id: incident.id.toString(), organizationId: incident.organizationId, serviceId: incident.serviceId,
    origin: incident.origin, state: incident.state, severity: incident.severity,
    operationalImpact: incident.operationalImpact, visibility: incident.visibility,
    version: incident.version, openedAt: incident.openedAt.toISOString(), openedBy: incident.openedBy };
}
