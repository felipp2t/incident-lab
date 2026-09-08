import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id.js";
import { Organization } from "../../../../domain/organization/enterprise/entities/organization.js";
import type { organizations } from "../schema.js";

type DrizzleOrganization = InferSelectModel<typeof organizations>;
type DrizzleOrganizationInsert = InferInsertModel<typeof organizations>;

export class DrizzleOrganizationMapper {
  static toDomain(raw: DrizzleOrganization) {
    return Organization.create(
      { name: raw.name, createdAt: raw.createdAt },
      new UniqueEntityID(raw.id)
    );
  }

  static toDrizzle(organization: Organization): DrizzleOrganizationInsert {
    return {
      id: organization.id.toString(),
      name: organization.name,
      createdAt: organization.createdAt
    };
  }
}
