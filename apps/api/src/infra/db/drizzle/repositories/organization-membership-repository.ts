import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { OrganizationMembershipRepository } from "../../../../domain/organization/application/repositories/organization-membership-repository.js";
import type { OrganizationMembershipAssociationResult } from "../../../../domain/organization/application/repositories/organization-membership-repository.js";
import { OrganizationMembership } from "../../../../domain/organization/enterprise/entities/organization-membership.js";
import type { Database } from "../index.js";
import { DrizzleOrganizationMembershipMapper } from "../mappers/drizzle-organization-membership-mapper.js";
import { commandReceipts, organizationMemberships, outbox, users } from "../schema.js";

const commandType = "AssociateOrganizationMember";

export class DrizzleOrganizationMembershipRepository extends OrganizationMembershipRepository {
  constructor(private readonly db: Database) {
    super();
  }

  async associate(input: Parameters<OrganizationMembershipRepository["associate"]>[0]): Promise<OrganizationMembershipAssociationResult> {
    if (input.organizationId !== input.membership.organizationId) return { kind: "forbidden" };

    return this.db.transaction(async (tx): Promise<OrganizationMembershipAssociationResult> => {
      const commandLockKey = `${input.actorId}:${commandType}:${input.commandId}`;
      const membershipLockKey = `${input.organizationId}:${input.membership.userId}`;
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${commandLockKey}, 0))`);
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${membershipLockKey}, 0))`);

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
        const stored = receipt.result as {
          organizationId: string;
          userId: string;
          role: "respondente" | "visualizador";
          createdAt: string;
        };
        return {
          kind: "replayed",
          value: OrganizationMembership.create({
            organizationId: stored.organizationId,
            userId: stored.userId,
            role: stored.role,
            createdAt: new Date(stored.createdAt)
          })
        };
      }

      const [actorMembership] = await tx
        .select({ role: organizationMemberships.role })
        .from(organizationMemberships)
        .where(and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.userId, input.actorId)
        ))
        .limit(1);

      if (actorMembership?.role !== "admin") return { kind: "forbidden" };

      const [user] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, input.membership.userId))
        .limit(1);

      if (!user) return { kind: "user_not_found" };

      const [existingMembership] = await tx
        .select({ organizationId: organizationMemberships.organizationId })
        .from(organizationMemberships)
        .where(and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.userId, input.membership.userId)
        ))
        .limit(1);

      if (existingMembership) return { kind: "already_member" };

      await tx.insert(organizationMemberships).values(DrizzleOrganizationMembershipMapper.toDrizzle(input.membership));

      await tx.insert(outbox).values({
        id: randomUUID(),
        eventType: "OrganizationMemberAssociated.v1",
        aggregateType: "OrganizationMembership",
        aggregateId: input.organizationId,
        organizationId: input.organizationId,
        actorId: input.actorId,
        correlationId: input.correlationId,
        causationId: input.commandId,
        payload: {
          organizationId: input.organizationId,
          userId: input.membership.userId,
          role: input.membership.role
        },
        occurredAt: input.membership.createdAt,
        createdAt: input.membership.createdAt
      });

      const response = {
        organizationId: input.organizationId,
        userId: input.membership.userId,
        role: input.membership.role as "respondente" | "visualizador",
        createdAt: input.membership.createdAt.toISOString()
      };

      await tx.insert(commandReceipts).values({
        actorId: input.actorId,
        commandType,
        commandId: input.commandId,
        requestHash: input.requestHash,
        result: response,
        createdAt: input.membership.createdAt
      });

      return { kind: "created", value: input.membership };
    });
  }
}
