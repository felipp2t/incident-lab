import assert from "node:assert/strict";
import { test } from "node:test";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id.js";
import { OrganizationCreatedEvent } from "../events/organization-created-event.js";
import { Organization } from "./organization.js";

test("records creation only for a new organization", () => {
  const created = Organization.create({ name: "Acme" });
  const restored = Organization.create({ name: "Acme" }, new UniqueEntityID(created.id.toString()));

  assert.ok(created.domainEvents[0] instanceof OrganizationCreatedEvent);
  assert.equal(restored.domainEvents.length, 0);
  assert.equal(created.equals(restored), true);
});
