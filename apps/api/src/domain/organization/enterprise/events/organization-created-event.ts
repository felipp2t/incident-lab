import type { UniqueEntityID } from "../../../../core/entities/unique-entity-id.js";
import type { DomainEvent } from "../../../../core/events/domain-event.js";
import type { Organization } from "../entities/organization.js";

export class OrganizationCreatedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(readonly organization: Organization) {
    this.occurredAt = organization.createdAt;
  }

  getAggregateId(): UniqueEntityID {
    return this.organization.id;
  }
}
