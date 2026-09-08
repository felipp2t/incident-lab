import type { BaseError } from "../../../../../core/errors/base-error.js";

export class InvalidOrganizationNameError extends Error implements BaseError {
  constructor() {
    super("Organization name is required.");
  }
}
