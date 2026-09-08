import type { DomainEvent } from "../events/domain-event.js";
import { Entity } from "./entity.js";

export abstract class AggregateRoot<Props> extends Entity<Props> {
  private events: DomainEvent[] = [];

  get domainEvents(): readonly DomainEvent[] {
    return this.events;
  }

  protected addDomainEvent(event: DomainEvent) {
    this.events.push(event);
  }

  clearEvents() {
    this.events = [];
  }
}
