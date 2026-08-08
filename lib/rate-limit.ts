/**
 * Best-effort flood protection for the public RSVP endpoint.
 *
 * In-memory and per-instance, so it is a speed bump rather than a guarantee —
 * enough to stop someone hammering the form from one phone, which is the only
 * abuse a birthday invite realistically sees. If we ever need more, the real
 * fix belongs at the edge, not here.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;

const hits = (() => {
  const g = globalThis as typeof globalThis & {
    __rsvpHits?: Map<string, number[]>;
  };
  g.__rsvpHits ??= new Map();
  return g.__rsvpHits;
})();

export function allowRequest(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);
  return true;
}
