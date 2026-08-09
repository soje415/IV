/**
 * Read a secret or plain-text variable.
 *
 * On Workers these arrive as Cloudflare *bindings*. The adapter does mirror
 * string bindings into `process.env`, so both work — but the binding is the
 * documented source of truth and does not depend on that mirroring, so it is
 * what we read first. `process.env` remains the fallback for `next dev` and
 * `.env.local`, where there is no Cloudflare context at all.
 *
 * An empty or whitespace-only value counts as unset. That matters: a secret
 * uploaded with a blank value is indistinguishable from a typo at the prompt,
 * and treating "" as configured would put an empty PIN on the door. A locked
 * page is the safe reading of a blank secret.
 */
export async function readEnv(name: string): Promise<string | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    const value = (context.env as Record<string, unknown>)[name];
    if (typeof value === "string" && value.trim() !== "") return value;
  } catch {
    // Not running on Workers — expected during `next dev`.
  }

  const local = process.env[name];
  return local !== undefined && local.trim() !== "" ? local : undefined;
}

/** True during `next dev`. Never true on a deployed Worker. */
export const isDev = () => process.env.NODE_ENV === "development";
