/*
 * Which Convex backend this build talks to.
 *
 * Kept separate from `convex.ts` on purpose: that module constructs a client
 * at import time, which touches `window`. The auth forms only need to know
 * whether a backend was configured at all — a build with no VITE_CONVEX_URL
 * falls back to 127.0.0.1, which is the visitor's own machine and can never
 * reach us — so this module answers that question without side effects.
 *
 * Storage keys and the sandbox hostname shape must stay in sync with
 * resolveConvexUrl's callers.
 */

/** Where a browser looks when nothing else is configured: its own machine. */
const FALLBACK_URL = "http://127.0.0.1:3210";

export function resolveConvexUrl(): { url: string; configured: boolean } {
  const configured: unknown = import.meta.env.VITE_CONVEX_URL;
  if (typeof configured === "string" && configured.length > 0) {
    return { url: configured, configured: true };
  }
  // In the Freebuff sandbox the preview is proxied as
  // `<port>-<sandbox>.e2b.app`, so Convex lives on port 3210 of the same host.
  const sandbox = /^(\d+)-([a-z0-9]+)\.e2b\.app$/i.exec(window.location.hostname);
  if (sandbox !== null) {
    return { url: `https://3210-${sandbox[2]}.e2b.app`, configured: true };
  }
  return { url: FALLBACK_URL, configured: false };
}

/**
 * False when this build shipped without a reachable Convex deployment. When it
 * is false, telling someone to “check your connection” is blaming them for our
 * deploy configuration, so callers must not say that.
 */
export function isBackendConfigured(): boolean {
  return resolveConvexUrl().configured;
}