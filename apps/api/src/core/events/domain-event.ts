import type { UniqueEntityID } from "../entities/unique-entity-id.js";

export interface DomainEvent {
  occurredAt: Date;
  getAggregateId(): UniqueEntityID;
}
