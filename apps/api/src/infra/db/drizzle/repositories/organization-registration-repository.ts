import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import type { OrganizationCreation } from "../../../../domain/organization/application/use-cases/create-organization.js";
import {
  OrganizationRegistrationRepository,
  type OrganizationRegistrationResult
} from "../../../../domain/organization/application/repositories/organization-registration-repository.js";
import { OrganizationMembership } from "../../../../domain/organization/enterprise/entities/organization-membership.js";
import { OrganizationCreatedEvent } from "../../../../domain/organization/enterprise/events/organization-created-event.js";
import type { Database } from "../index.js";
import { DrizzleOrganizationMembershipMapper } from "../mappers/drizzle-organization-membership-mapper.js";
import { DrizzleOrganizationMapper } from "../mappers/drizzle-organization-mapper.js";
import { commandReceipts, organizationMemberships, organizations, outbox, sessions } from "../schema.js";

const commandType = "CreateOrganization";

export class DrizzleOrganizationRegistrationRepository extends OrganizationRegistrationRepository {
  constructor(private readonly db: Database) {
    super();
  }

  async register(input: Parameters<OrganizationRegistrationRepository["register"]>[0]): Promise<OrganizationRegistrationResult> {
    const result = await this.db.transaction(async (tx): Promise<OrganizationRegistrationResult> => {
      const lockKey = `${input.actorId}:${commandType}`;
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`);

      const [receipt] = await tx
        .select({ requestHash: commandReceipts.requestHash, result: commandReceipts.result })
        .from(commandReceipts)
        .where(and(
          eq(commandReceipts.actorId, input.actorId),
          eq(commandReceipts.commandType, commandType),
          eq(commandReceipts.commandId, input.commandId)
        ))
        .limit(1);

      if (receipt) {
        if (receipt.requestHash !== input.requestHash) return { kind: "conflict" };

        const stored = receipt.result as OrganizationCreation;
        const organization = DrizzleOrganizationMapper.toDomain({
          id: stored.organization.id,
          name: stored.organization.name,
          createdAt: new Date(stored.organization.createdAt)
        });
        const membership = OrganizationMembership.create({
          organizationId: organization.id.toString(),
          userId: stored.membership.userId,
          role: stored.membership.role,
          createdAt: organization.createdAt
        });
        return { kind: "replayed", value: { organization, membership } };
      }

      const [existingMembership] = await tx
        .select({ organizationId: organizationMemberships.organizationId })
        .from(organizationMemberships)
        .where(eq(organizationMemberships.userId, input.actorId))
        .limit(1);

      if (existingMembership) return { kind: "already_member" };

      await tx.insert(organizations).values(DrizzleOrganizationMapper.toDrizzle(input.organization));
      await tx.insert(organizationMemberships).values(DrizzleOrganizationMembershipMapper.toDrizzle(input.membership));
      await tx
        .update(sessions)
        .set({ activeOrganizationId: input.organization.id.toString() })
        .where(eq(sessions.tokenHash, input.sessionTokenHash));

      const response: OrganizationCreation = {
        organization: {
          id: input.organization.id.toString(),
          name: input.organization.name,
          createdAt: input.organization.createdAt.toISOString()
        },
        membership: { userId: input.membership.userId, role: "admin" }
      };

      await tx.insert(commandReceipts).values({
        actorId: input.actorId,
        commandType,
        commandId: input.commandId,
        requestHash: input.requestHash,
        result: response,
        createdAt: input.organization.createdAt
      });

      const event = input.organization.domainEvents.find(
        (candidate): candidate is OrganizationCreatedEvent => candidate instanceof OrganizationCreatedEvent
      );
      if (!event) throw new Error("organization_created_event_missing");

      await tx.insert(outbox).values({
        id: randomUUID(),
        eventType: "OrganizationCreated.v1",
        aggregateType: "Organization",
        aggregateId: event.getAggregateId().toString(),
        organizationId: event.organization.id.toString(),
        actorId: input.actorId,
        correlationId: input.correlationId,
        causationId: input.commandId,
        payload: {
          organizationId: event.organization.id.toString(),
          firstAdminUserId: input.membership.userId,
          name: event.organization.name
        },
        occurredAt: event.occurredAt,
        createdAt: event.occurredAt
      });

      return { kind: "created", value: { organization: input.organization, membership: input.membership } };
    });

    input.organization.clearEvents();
    return result;
  }
}
