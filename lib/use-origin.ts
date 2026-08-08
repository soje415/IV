"use client";

import { useSyncExternalStore } from "react";
import { EVENT } from "@/config/event";

const noopSubscribe = () => () => {};

/**
 * The page's real origin on the client, the configured site URL on the server.
 *
 * Lets QR codes and share links point at whatever host is actually serving the
 * page — including localhost while testing — without the server and client
 * rendering different markup. `useSyncExternalStore` is the sanctioned way to
 * read a browser-only value: no effect, no setState, no hydration mismatch.
 */
export function useOrigin() {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => EVENT.siteUrl,
  );
}
