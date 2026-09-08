import { createHash, randomBytes } from "node:crypto";

export const sessionCookie = "incidentlab_session";
export const sessionLifetimeSeconds = 60 * 60 * 12;

export function createSessionToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashSessionToken(token) };
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
