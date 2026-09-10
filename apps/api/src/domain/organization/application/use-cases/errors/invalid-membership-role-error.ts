import type { BaseError } from "../../../../../core/errors/base-error.js";

export class InvalidMembershipRoleError extends Error implements BaseError {
  constructor() {
    super("Only respondente or visualizador can be assigned to a member.");
  }
}
