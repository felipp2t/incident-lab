import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { OrganizationMembership } from "../../../../domain/organization/enterprise/entities/organization-membership.js";
import type { organizationMemberships } from "../schema.js";

type DrizzleOrganizationMembership = InferSelectModel<typeof organizationMemberships>;
type DrizzleOrganizationMembershipInsert = InferInsertModel<typeof organizationMemberships>;

export class DrizzleOrganizationMembershipMapper {
  static toDomain(raw: DrizzleOrganizationMembership) {
    return OrganizationMembership.create({
      organizationId: raw.organizationId,
      userId: raw.userId,
      role: raw.role,
      createdAt: raw.createdAt
    });
  }

  static toDrizzle(membership: OrganizationMembership): DrizzleOrganizationMembershipInsert {
    return {
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.role,
      createdAt: membership.createdAt
    };
  }
}
