import { randomUUID } from "node:crypto";

export class UniqueEntityID {
  constructor(private readonly value: string = randomUUID()) {}

  toString() {
    return this.value;
  }

  equals(id: UniqueEntityID) {
    return id.value === this.value;
  }
}
