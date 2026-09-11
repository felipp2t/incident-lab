import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { MonitoredServiceRegistrationRepository } from "../../../../domain/monitoring/application/repositories/monitored-service-registration-repository.js";
import type { MonitoredServiceRegistrationResult } from "../../../../domain/monitoring/application/repositories/monitored-service-registration-repository.js";
import type { MonitoredService } from "../../../../domain/monitoring/enterprise/entities/monitored-service.js";
import type { Database } from "../index.js";
import { DrizzleMonitoredServiceMapper } from "../mappers/drizzle-monitored-service-mapper.js";
import { commandReceipts, monitoredServices, organizationMemberships, outbox } from "../schema.js";

const commandType = "CreateMonitoredService";

type StoredMonitoredService = {
  id: string;
  organizationId: string;
  name: string;
  active: boolean;
  operationalState: MonitoredService["operationalState"];
  createdAt: string;
};

export class DrizzleMonitoredServiceRegistrationRepository extends MonitoredServiceRegistrationRepository {
  constructor(private readonly db: Database) {
    super();
  }

  async register(
    input: Parameters<MonitoredServiceRegistrationRepository["register"]>[0]
  ): Promise<MonitoredServiceRegistrationResult> {
    if (input.organizationId !== input.service.organizationId) return { kind: "forbidden" };

    return this.db.transaction(async (tx): Promise<MonitoredServiceRegistrationResult> => {
      const lockKey = `${input.actorId}:${commandType}:${input.commandId}`;
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`);

      const [actorMembership] = await tx
        .select({ role: organizationMemberships.role })
        .from(organizationMemberships)
        .where(
          and(
            eq(organizationMemberships.organizationId, input.organizationId),
            eq(organizationMemberships.userId, input.actorId)
          )
        )
        .limit(1)
        .for("update");

      if (actorMembership?.role !== "admin") return { kind: "forbidden" };

      const [receipt] = await tx
        .select({ requestHash: commandReceipts.requestHash, result: commandReceipts.result })
        .from(commandReceipts)
        .where(
          and(
            eq(commandReceipts.actorId, input.actorId),
            eq(commandReceipts.commandType, commandType),
            eq(commandReceipts.commandId, input.commandId)
          )
        )
        .limit(1);

      if (receipt) {
        if (receipt.requestHash !== input.requestHash) return { kind: "conflict" };

        const stored = receipt.result as StoredMonitoredService;
        return {
          kind: "replayed",
          value: DrizzleMonitoredServiceMapper.toDomain({
            id: stored.id,
            organizationId: stored.organizationId,
            name: stored.name,
            active: stored.active,
            operationalState: stored.operationalState,
            createdAt: new Date(stored.createdAt)
          })
        };
      }

      await tx.insert(monitoredServices).values(DrizzleMonitoredServiceMapper.toDrizzle(input.service));

      const response: StoredMonitoredService = {
        id: input.service.id.toString(),
        organizationId: input.service.organizationId,
        name: input.service.name,
        active: input.service.active,
        operationalState: input.service.operationalState,
        createdAt: input.service.createdAt.toISOString()
      };

      await tx.insert(commandReceipts).values({
        actorId: input.actorId,
        commandType,
        commandId: input.commandId,
        requestHash: input.requestHash,
        result: response,
        createdAt: input.service.createdAt
      });

      await tx.insert(outbox).values({
        id: randomUUID(),
        eventType: "MonitoredServiceCreated.v1",
        aggregateType: "MonitoredService",
        aggregateId: input.service.id.toString(),
        organizationId: input.organizationId,
        actorId: input.actorId,
        correlationId: input.correlationId,
        causationId: input.commandId,
        payload: {
          serviceId: input.service.id.toString(),
          organizationId: input.organizationId,
          name: input.service.name,
          active: input.service.active,
          operationalState: input.service.operationalState
        },
        occurredAt: input.service.createdAt,
        createdAt: input.service.createdAt
      });

      return { kind: "created", value: input.service };
    });
  }
}
