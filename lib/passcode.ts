import { createHmac, randomUUID } from "node:crypto";
import { readEnv } from "@/lib/env";

/**
 * Pass codes look like `TAB-7QK4-9F`: a random body plus a short HMAC suffix.
 *
 * The suffix means a code can't be guessed by trying neighbours of one you were
 * given, so `/p/<code>` stays effectively private without needing a login. It is
 * not a security boundary on its own — the door list is the source of truth.
 *
 * Signing is async because the secret is a Cloudflare binding, which can only be
 * read from inside a request. See lib/env.ts for why `process.env` will not do.
 */

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/L
const BODY_LENGTH = 6;
const SIGNATURE_LENGTH = 2;

const DEV_SECRET = "dev-only-pass-secret-change-in-production";

async function secret() {
  return (await readEnv("PASS_SECRET")) ?? DEV_SECRET;
}

function signWith(body: string, key: string) {
  const digest = createHmac("sha256", key).update(body).digest();
  let out = "";
  for (let i = 0; i < SIGNATURE_LENGTH; i++) {
    out += ALPHABET[digest[i] % ALPHABET.length];
  }
  return out;
}

function randomBody() {
  const bytes = randomUUID().replace(/-/g, "");
  let out = "";
  for (let i = 0; i < BODY_LENGTH; i++) {
    out += ALPHABET[parseInt(bytes.slice(i * 2, i * 2 + 2), 16) % ALPHABET.length];
  }
  return out;
}

export async function createPassCode() {
  const body = randomBody();
  return `TAB-${body}-${signWith(body, await secret())}`;
}

/**
 * A stable code derived from a string, for seed data only.
 *
 * Means the sample families keep the same pass links across restarts, so a
 * /p/<code> URL stays bookmarkable while developing. Real RSVPs get random
 * codes from `createPassCode`.
 */
export async function seedPassCode(input: string) {
  const digest = createHmac("sha256", "seed").update(input).digest();
  let body = "";
  for (let i = 0; i < BODY_LENGTH; i++) {
    body += ALPHABET[digest[i] % ALPHABET.length];
  }
  return `TAB-${body}-${signWith(body, await secret())}`;
}

export async function isValidPassCode(code: string) {
  const match = /^TAB-([A-Z0-9]{6})-([A-Z0-9]{2})$/.exec(code.trim().toUpperCase());
  if (!match) return false;
  return signWith(match[1], await secret()) === match[2];
}

export function normalisePassCode(code: string) {
  return code.trim().toUpperCase();
}
