import type { MonitoredService } from "../../enterprise/entities/monitored-service.js";

export type MonitoredServiceRegistrationResult =
  | { kind: "created" | "replayed"; value: MonitoredService }
  | { kind: "conflict" | "forbidden" };

export abstract class MonitoredServiceRegistrationRepository {
  abstract register(input: {
    organizationId: string;
    service: MonitoredService;
    actorId: string;
    commandId: string;
    correlationId: string;
    requestHash: string;
  }): Promise<MonitoredServiceRegistrationResult>;
}
