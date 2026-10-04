import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useConvexAuth } from "@convex-dev/auth/react";

/*
 * Set right before the user chooses to sign out, so that leaving on purpose
 * is not reported back as an expired session.
 */
let intentionalSignOut = false;

export function markIntentionalSignOut() {
  intentionalSignOut = true;
}

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
  const sawSession = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      sawSession.current = true;
      intentionalSignOut = false;
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <SessionLoading />;
  }

  if (!isAuthenticated) {
    const sessionExpired = sawSession.current && !intentionalSignOut;
    const params = new URLSearchParams({
      returnTo: location.pathname + location.search,
    });
    if (sessionExpired) {
      params.set("expired", "1");
    }
    return <Navigate to={`/auth?${params.toString()}`} replace />;
  }

  sawSession.current = true;
  return <Outlet />;
}
