import type { FastifyPluginAsync } from "fastify";
import type { Database } from "../db/drizzle/index.js";
import { createOrganizationController } from "./controllers/create-organization.controller.js";
import { createSessionController } from "./controllers/create-session.controller.js";
import { deleteSessionController } from "./controllers/delete-session.controller.js";
import { getMeController } from "./controllers/get-me.controller.js";
import { makeCreateOrganizationUseCase } from "./factories/make-create-organization-use-case.js";

export function routes(db: Database): FastifyPluginAsync {
  return async (app) => {
    await app.register(createSessionController(db));
    await app.register(getMeController(db));
    await app.register(deleteSessionController(db));
    await app.register(createOrganizationController(db, makeCreateOrganizationUseCase(db)));
  };
}
