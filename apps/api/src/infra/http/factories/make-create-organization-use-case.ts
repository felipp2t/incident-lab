import { CreateOrganizationUseCase } from "../../../domain/organization/application/use-cases/create-organization.js";
import type { Database } from "../../db/drizzle/index.js";
import { DrizzleOrganizationRegistrationRepository } from "../../db/drizzle/repositories/organization-registration-repository.js";

export function makeCreateOrganizationUseCase(db: Database) {
  return new CreateOrganizationUseCase(new DrizzleOrganizationRegistrationRepository(db));
}
