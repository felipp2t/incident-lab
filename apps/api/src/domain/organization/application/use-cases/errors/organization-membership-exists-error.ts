import type { BaseError } from "../../../../../core/errors/base-error.js";

export class OrganizationMembershipExistsError extends Error implements BaseError {
  constructor() {
    super("The user already belongs to an organization.");
  }
}
