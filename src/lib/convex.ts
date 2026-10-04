import { ConvexReactClient } from "convex/react";

/**
 * The browser talks to Convex on its own port. In the Freebuff sandbox the
 * preview is proxied as `<port>-<sandbox>.e2b.app`, so the Convex port is
 * reachable at the same sandbox host on port 3210. Any other environment can
 * override this with VITE_CONVEX_URL pointing at a hosted deployment.
 */
function resolveConvexUrl(): string {
  const configured: unknown = import.meta.env.VITE_CONVEX_URL;
  if (typeof configured === "string" && configured.length > 0) {
    return configured;
  }
  const sandbox = /^(\d+)-([a-z0-9]+)\.e2b\.app$/i.exec(window.location.hostname);
  if (sandbox) {
    return `https://3210-${sandbox[2]}.e2b.app`;
  }
  return "http://127.0.0.1:3210";
}

export const convex = new ConvexReactClient(resolveConvexUrl());
