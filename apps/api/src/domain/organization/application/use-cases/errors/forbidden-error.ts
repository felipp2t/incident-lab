import type { BaseError } from "../../../../../core/errors/base-error.js";

export class ForbiddenError extends Error implements BaseError {
  constructor() {
    super("The actor is not allowed to manage members in this organization.");
  }
}
