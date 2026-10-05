import { useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useConvexAuth } from "@convex-dev/auth/react";

const ALLOWED_RETURN_PATHS = new Set([
  "/app",
]);

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
  const location = useLocation();
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
