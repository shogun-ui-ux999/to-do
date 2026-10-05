/*
 * Which Convex backend this build talks to.
 *
 * Kept separate from `convex.ts` on purpose: that module constructs a client
 * at import time, which touches `window`. The auth forms only need to know
 * whether a backend was resolved at all — so this module answers that
 * question without side effects.
 */

/**
 * The Convex Cloud deployment this app talks to.
 *
 * A public endpoint — the browser has to contain it in plaintext anyway — and
 * the default on purpose: Freebuff hosting builds the static site without
 * injecting production env vars into the client bundle, so a
 * VITE_CONVEX_URL-only build shipped with no backend at all and every account
 * creation failed. Override it with VITE_CONVEX_URL to point somewhere else
 * (a local `bun convex dev`, for instance).
 */
const DEPLOYED_BACKEND = "https://uncommon-spaniel-287.convex.cloud";

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
  return { url: DEPLOYED_BACKEND, configured: true };
}

/**
 * False only when no URL can be resolved at all. When it
 * is false, telling someone to “check your connection” is blaming them for our
 * deploy configuration, so callers must not say that.
 */
export function isBackendConfigured(): boolean {
  return resolveConvexUrl().configured;
}