import { useRef } from "react";
import { Navigate, Outlet } from "react-router";
import { useConvexAuth } from "@convex-dev/auth/react";

/**
 * Always send signed-out traffic to /auth?returnTo=/app.
 *
 * The auth page itself owns the final allowlist via `safeReturnTo()`, so this
 * component does not try to re-validate the destination here — it just picks
 * the one destination the app currently treats as the post-auth home.
 */
function SessionLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-separator border-t-accent"
        role="status"
        aria-label="Checking your session"
      />
    </div>
  );
}

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const wasSignedIn = useRef(false);

  if (isLoading) {
    return <SessionLoading />;
  }

  if (!isAuthenticated) {
    const sessionExpired = wasSignedIn.current;
    const params = new URLSearchParams({
      returnTo: "/app",
    });
    if (sessionExpired) {
      params.set("expired", "1");
    }
    return <Navigate to={`/auth?${params.toString()}`} replace />;
  }

  wasSignedIn.current = true;
  return <Outlet />;
}
