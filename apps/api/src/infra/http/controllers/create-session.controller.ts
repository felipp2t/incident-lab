import type { FastifyPluginAsync } from "fastify";
import { eq } from "drizzle-orm";
import { createSessionToken, sessionCookie, sessionLifetimeSeconds } from "../../auth/session.js";
import { verifyPassword } from "../../auth/password.js";
import type { Database } from "../../db/drizzle/index.js";
import { sessions, users } from "../../db/drizzle/schema.js";

interface LoginBody {
  email: string;
  password: string;
}

export function createSessionController(db: Database): FastifyPluginAsync {
  return async (app) => {
    app.post<{ Body: LoginBody }>("/sessions", {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", maxLength: 320 },
            password: { type: "string", minLength: 1, maxLength: 1024 }
          }
        }
      }
    }, async (request, reply) => {
      const email = request.body.email.trim().toLowerCase();
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || !(await verifyPassword(request.body.password, user.passwordHash))) {
        return reply.code(401).send({ error: "invalid_credentials" });
      }

      const { token, tokenHash } = createSessionToken();
      const expiresAt = new Date(Date.now() + sessionLifetimeSeconds * 1000);
      await db.insert(sessions).values({ tokenHash, userId: user.id, expiresAt });

      reply.setCookie(sessionCookie, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: sessionLifetimeSeconds
      });

      return reply.code(201).send({ user: { id: user.id, email: user.email, name: user.name } });
    });
  };
}
