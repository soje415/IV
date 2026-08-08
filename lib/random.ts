/**
 * Deterministic pseudo-random numbers (mulberry32).
 *
 * Decorative particles need scattered positions, but `Math.random()` would give
 * the server and the client different answers and trip a hydration mismatch.
 * A fixed seed produces the same scatter in both places.
 */
export function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Builds `count` items from a stable seed. */
export function scatter<T>(seed: number, count: number, make: (rand: () => number, i: number) => T): T[] {
  const rand = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => make(rand, i));
}
