import type { BaseError } from "../../../../../core/errors/base-error.js";

export class InvalidMonitoredServiceNameError extends Error implements BaseError {
  constructor() {
    super("Monitored service name is required.");
  }
}
