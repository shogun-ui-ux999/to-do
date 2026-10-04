import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Check } from "lucide-react";
import { SignInForm } from "./signin-form";
import { SignUpForm } from "./signup-form";

/** Only allow same-site paths back, so a crafted link can't redirect off-site. */
function safeReturnTo(value: string | null): string {
  if (value === null || !value.startsWith("/") || value.startsWith("//")) {
    return "/app";
  }
  return value;
}

export function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const mode = searchParams.get("action") === "signup" ? "signup" : "signin";
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const expired = searchParams.get("expired") === "1";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, returnTo]);

  const switchMode = (next: "signin" | "signup") => {
    const params = new URLSearchParams(searchParams);
    params.set("action", next);
    setSearchParams(params, { replace: true });
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div
          className="h-6 w-6 animate-spinner rounded-full border-2 border-border border-t-accent"
          role="status"
          aria-label="Checking your session"
        />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-4 py-8 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-on-accent"
            aria-hidden="true"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Tally
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {mode === "signin"
                ? "Sign in to pick up your list where you left it."
                : "One email, one password, and your list is waiting."}
            </p>

            {expired && (
              <p
                role="status"
                className="mt-5 rounded-md border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
              >
                Your session expired, so we signed you out. Sign in again to get
                back to your list.
              </p>
            )}

            <div className="mt-6">
              {mode === "signin" ? <SignInForm /> : <SignUpForm />}
            </div>

            <p className="mt-6 text-center text-sm text-muted">
              {mode === "signin" ? (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-medium text-accent underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="font-medium text-accent underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Pitch side */}
      <aside className="hidden flex-col justify-between bg-text px-12 py-12 text-bg lg:flex">
        <p className="text-xs font-medium tracking-[0.14em] uppercase text-bg/60">
          Tally
        </p>
        <div>
          <h2 className="font-display text-4xl leading-[1.05] font-semibold">
            A clear list is a clear head.
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              "One list, ordered so the next thing is always on top.",
              "Five seconds of undo after every delete.",
              "Every task is locked to your account on the server.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-bg/80">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-bg/50">
          Small by design. No notifications, no sharing, no settings.
        </p>
      </aside>
    </div>
  );
}
