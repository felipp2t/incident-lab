import { Entity } from "../../../../core/entities/entity.js";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id.js";
import type { Optional } from "../../../../core/types/optional.js";

export type MembershipRole = "admin" | "respondente" | "visualizador";

export interface OrganizationMembershipProps {
  organizationId: string;
  userId: string;
  role: MembershipRole;
  createdAt: Date;
}

export class OrganizationMembership extends Entity<OrganizationMembershipProps> {
  get organizationId() {
    return this.props.organizationId;
  }

  get userId() {
    return this.props.userId;
  }

  get role() {
    return this.props.role;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<OrganizationMembershipProps, "createdAt">) {
    return new OrganizationMembership(
      { ...props, createdAt: props.createdAt ?? new Date() },
      new UniqueEntityID(`${props.organizationId}:${props.userId}`)
    );
  }
}
