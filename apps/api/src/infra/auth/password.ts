import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const keyLength = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, keyLength)) as Buffer;
  return `scrypt:${salt.toString("base64url")}:${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, saltText, hashText] = encoded.split(":");
  if (algorithm !== "scrypt" || !saltText || !hashText) return false;

  const expected = Buffer.from(hashText, "base64url");
  const actual = (await scrypt(password, Buffer.from(saltText, "base64url"), expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
