import type { BaseError } from "../../../../../core/errors/base-error.js";

export class IdempotencyConflictError extends Error implements BaseError {
  constructor() {
    super("The command identifier was already used with different content.");
  }
}
