import type { FastifyPluginAsync } from "fastify";
import type { Database } from "../db/drizzle/index.js";
import { associateOrganizationMemberController } from "./controllers/associate-organization-member.controller.js";
import { createOrganizationController } from "./controllers/create-organization.controller.js";
import { createMonitoredServiceController } from "./controllers/create-monitored-service.controller.js";
import { createSessionController } from "./controllers/create-session.controller.js";
import { deleteSessionController } from "./controllers/delete-session.controller.js";
import { getMeController } from "./controllers/get-me.controller.js";
import { switchActiveOrganizationController } from "./controllers/switch-active-organization.controller.js";
import { makeAssociateOrganizationMemberUseCase } from "./factories/make-associate-organization-member-use-case.js";
import { makeCreateMonitoredServiceUseCase } from "./factories/make-create-monitored-service-use-case.js";
import { makeCreateOrganizationUseCase } from "./factories/make-create-organization-use-case.js";

export function routes(db: Database): FastifyPluginAsync {
  return async (app) => {
    await app.register(createSessionController(db));
    await app.register(getMeController(db));
    await app.register(switchActiveOrganizationController(db));
    await app.register(deleteSessionController(db));
    await app.register(createOrganizationController(db, makeCreateOrganizationUseCase(db)));
    await app.register(associateOrganizationMemberController(db, makeAssociateOrganizationMemberUseCase(db)));
    await app.register(createMonitoredServiceController(db, makeCreateMonitoredServiceUseCase(db)));
  };
}
