/**
 * The slice of the D1 API this app uses.
 *
 * Declared structurally rather than pulling in @cloudflare/workers-types, whose
 * global DOM overrides collide with Next's. Five methods is the whole surface.
 */

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta?: { changes?: number } }>;
}

export interface D1Like {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

/**
 * The D1 binding when running on Cloudflare, otherwise null.
 *
 * The adapter package only exists inside the Worker runtime, so the import is
 * dynamic and failures are expected — during `next dev` there is no binding and
 * the app falls back to the in-memory store.
 */
export async function getD1(): Promise<D1Like | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    const binding = (context.env as Record<string, unknown>).DB;
    return binding ? (binding as D1Like) : null;
  } catch {
    return null;
  }
}
