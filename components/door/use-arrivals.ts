"use client";

import { useSyncExternalStore } from "react";
import { checkIn } from "@/app/door/actions";

/**
 * Arrivals that survive bad signal.
 *
 * Tapping MARK ARRIVED updates the row immediately and queues the write. If the
 * write fails the id stays queued in localStorage and is retried on a timer and
 * whenever the browser comes back online, so a bouncer never has to remember
 * who did not save. `checkIn` is idempotent, so a retry that turns out to be a
 * duplicate simply reports the original arrival time.
 *
 * The queue lives outside React on purpose: it has to outlive any one component
 * — the list and a scanned pass are two views onto the same pending writes —
 * and a retry that lands while nothing is mounted must still be recorded.
 *
 * This is deliberately not a full offline mode. With no service worker the page
 * has to have loaded at least once. It covers the failure that actually happens
 * at a venue: signal dropping out while the list is already open.
 */

const STORAGE_KEY = "door-arrivals-v1";
const RETRY_MS = 15_000;

interface State {
  /** Family id → ISO arrival time, as far as this phone knows. */
  arrivals: Record<string, string>;
  /** Ids whose write has not been acknowledged yet. */
  pending: string[];
  /** The door session went stale — no amount of retrying will help. */
  expired: boolean;
}

const EMPTY: State = { arrivals: {}, pending: [], expired: false };

let state: State = EMPTY;
let hydrated = false;
let timer: number | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function restore(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      arrivals: parsed.arrivals ?? {},
      pending: parsed.pending ?? [],
      // Never restore an expiry: the session may well have been renewed since.
      expired: false,
    };
  } catch {
    return EMPTY;
  }
}

function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ arrivals: next.arrivals, pending: next.pending }),
    );
  } catch {
    // Private mode or a full quota. The in-memory queue still works.
  }
  emit();
}

let flushing = false;

async function flush() {
  if (flushing) return;
  flushing = true;
  try {
    for (const id of [...state.pending]) {
      try {
        const result = await checkIn(id);

        if (result.status === "marked" || result.status === "already") {
          // Adopt the server's time: another bouncer may have got there first.
          commit({
            ...state,
            arrivals: { ...state.arrivals, [id]: result.arrivedAt },
            pending: state.pending.filter((p) => p !== id),
          });
          continue;
        }

        // Session expired, or the family is gone. Retrying fixes neither.
        commit({
          ...state,
          pending: state.pending.filter((p) => p !== id),
          expired: state.expired || result.status === "denied",
        });
      } catch {
        // Network failure. Leave it queued for the timer or the online event.
      }
    }
  } finally {
    flushing = false;
  }
}

function retryQueued() {
  if (state.pending.length > 0) void flush();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!hydrated) {
    hydrated = true;
    state = restore();
    timer = window.setInterval(retryQueued, RETRY_MS);
    window.addEventListener("online", retryQueued);
    retryQueued(); // Anything left over from a previous visit.
    emit();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      window.removeEventListener("online", retryQueued);
      timer = null;
      hydrated = false;
    }
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

/** Record an arrival on this device and queue the write. */
export function markArrived(id: string) {
  if (state.arrivals[id]) return;
  commit({
    ...state,
    arrivals: { ...state.arrivals, [id]: new Date().toISOString() },
    pending: state.pending.includes(id) ? state.pending : [...state.pending, id],
  });
  void flush();
}

export function useArrivals() {
  const { arrivals, pending, expired } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { arrivals, pending, expired, mark: markArrived };
}
