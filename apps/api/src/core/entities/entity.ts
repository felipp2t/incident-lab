import { UniqueEntityID } from "./unique-entity-id.js";

export abstract class Entity<Props> {
  protected constructor(protected readonly props: Props, private readonly entityId = new UniqueEntityID()) {}

  get id() {
    return this.entityId;
  }

  equals(entity: Entity<unknown>) {
    return entity === this || entity.id.equals(this.entityId);
  }
}
