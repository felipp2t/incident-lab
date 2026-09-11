import { CreateMonitoredServiceUseCase } from "../../../domain/monitoring/application/use-cases/create-monitored-service.js";
import type { Database } from "../../db/drizzle/index.js";
import { DrizzleMonitoredServiceRegistrationRepository } from "../../db/drizzle/repositories/monitored-service-registration-repository.js";

export function makeCreateMonitoredServiceUseCase(db: Database) {
  return new CreateMonitoredServiceUseCase(new DrizzleMonitoredServiceRegistrationRepository(db));
}
