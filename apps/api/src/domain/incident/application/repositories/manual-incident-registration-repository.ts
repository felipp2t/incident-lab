import type { Incident } from "../../enterprise/entities/incident.js";

export type ManualIncidentRegistrationResult =
  | { kind: "created" | "replayed"; value: Incident }
  | { kind: "conflict" | "forbidden" | "service_not_found" | "service_inactive" };

export abstract class ManualIncidentRegistrationRepository {
  abstract register(input: {
    organizationId: string;
    serviceId: string;
    incident: Incident;
    actorId: string;
    commandId: string;
    correlationId: string;
    requestHash: string;
  }): Promise<ManualIncidentRegistrationResult>;
}
