/**
 * Read a secret or plain-text variable.
 *
 * On Workers these arrive as Cloudflare *bindings*, not real environment
 * variables. The adapter mirrors string bindings into `process.env`, but that
 * copy is not reliable: a secret added after the Worker was first created never
 * appears there. Measured on this deployment — `getCloudflareContext().env` had
 * ADMIN_PIN while `process.env.ADMIN_PIN` was undefined, and PASS_SECRET was
 * present in both only because it happened to exist before the first deploy.
 *
 * So the binding is the source of truth and `process.env` is the fallback, for
 * `next dev` and `.env.local` where there is no Cloudflare context at all.
 * Getting this backwards is why the dashboard stayed locked, and it would have
 * silently signed pass codes with the development secret.
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
