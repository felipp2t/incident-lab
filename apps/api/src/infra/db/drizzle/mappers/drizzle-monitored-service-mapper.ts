import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id.js";
import { MonitoredService } from "../../../../domain/monitoring/enterprise/entities/monitored-service.js";
import type { monitoredServices } from "../schema.js";

type DrizzleMonitoredService = InferSelectModel<typeof monitoredServices>;
type DrizzleMonitoredServiceInsert = InferInsertModel<typeof monitoredServices>;

export class DrizzleMonitoredServiceMapper {
  static toDomain(raw: DrizzleMonitoredService) {
    return MonitoredService.create(
      {
        organizationId: raw.organizationId,
        name: raw.name,
        active: raw.active,
        operationalState: raw.operationalState,
        createdAt: raw.createdAt
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toDrizzle(service: MonitoredService): DrizzleMonitoredServiceInsert {
    return {
      id: service.id.toString(),
      organizationId: service.organizationId,
      name: service.name,
      active: service.active,
      operationalState: service.operationalState,
      createdAt: service.createdAt
    };
  }
}
