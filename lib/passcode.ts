import { createHmac, randomUUID } from "node:crypto";

/**
 * Pass codes look like `TAB-7QK4-9F`: a random body plus a short HMAC suffix.
 *
 * The suffix means a code can't be guessed by trying neighbours of one you were
 * given, so `/p/<code>` stays effectively private without needing a login. It is
 * not a security boundary on its own — the door list is the source of truth.
 */

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/L
const BODY_LENGTH = 6;
const SIGNATURE_LENGTH = 2;

function secret() {
  return process.env.PASS_SECRET ?? "dev-only-pass-secret-change-in-production";
}

function sign(body: string) {
  const digest = createHmac("sha256", secret()).update(body).digest();
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

const format = (body: string) => `TAB-${body}-${sign(body)}`;

export function createPassCode() {
  return format(randomBody());
}

/**
 * A stable code derived from a string, for seed data only.
 *
 * Means the sample families keep the same pass links across restarts, so a
 * /p/<code> URL stays bookmarkable while developing. Real RSVPs get random
 * codes from `createPassCode`.
 */
export function seedPassCode(input: string) {
  const digest = createHmac("sha256", "seed").update(input).digest();
  let body = "";
  for (let i = 0; i < BODY_LENGTH; i++) {
    body += ALPHABET[digest[i] % ALPHABET.length];
  }
  return format(body);
}

export function isValidPassCode(code: string) {
  const match = /^TAB-([A-Z0-9]{6})-([A-Z0-9]{2})$/.exec(code.trim().toUpperCase());
  if (!match) return false;
  return sign(match[1]) === match[2];
}

export function normalisePassCode(code: string) {
  return code.trim().toUpperCase();
}
