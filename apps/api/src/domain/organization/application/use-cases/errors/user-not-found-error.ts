import type { BaseError } from "../../../../../core/errors/base-error.js";

export class UserNotFoundError extends Error implements BaseError {
  constructor() {
    super("The selected user does not exist.");
  }
}
