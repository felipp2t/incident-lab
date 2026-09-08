import { AggregateRoot } from "../../../../core/entities/aggregate-root.js";
import type { UniqueEntityID } from "../../../../core/entities/unique-entity-id.js";
import type { Optional } from "../../../../core/types/optional.js";
import { OrganizationCreatedEvent } from "../events/organization-created-event.js";

export interface OrganizationProps {
  name: string;
  createdAt: Date;
}

export class Organization extends AggregateRoot<OrganizationProps> {
  get name() {
    return this.props.name;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<OrganizationProps, "createdAt">, id?: UniqueEntityID) {
    const organization = new Organization(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id
    );

    if (!id) organization.addDomainEvent(new OrganizationCreatedEvent(organization));
    return organization;
  }
}
