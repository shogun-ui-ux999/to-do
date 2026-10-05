import { useState, type FormEvent } from "react";
import { useConvexConnectionState } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "~/lib/components/ui/button";
import { Input } from "~/lib/components/ui/input";
import { Label } from "~/lib/components/ui/label";
import { PasswordInput } from "~/lib/components/ui/password-input";
import { authErrorMessage } from "~/lib/errors";

/** If the request settles but the session never flips, a permanently
 * disabled button would trap the user with no way back. After this long we
 * re-enable the form and ask them to retry — bounded, and user-triggered. */
const SIGN_IN_TIMEOUT_MS = 15_000;

export function SignInForm() {
  const { signIn } = useAuthActions();
  // Convex runs everything over a WebSocket. With that socket down a sign-in
  // request never settles — it queues and retries silently — so check the
  // connection up front and say so immediately instead of leaving the user
  // staring at a disabled button.
  const { isWebSocketConnected } = useConvexConnectionState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length === 0) {
      setError("Enter your password.");
      return;
    }
    if (!isWebSocketConnected) {
      setError(
        "We can’t reach the server right now, so we can’t check those details yet. Check your connection and try again."
      );
      return;
    }
    setSubmitting(true);
    // Deliberately not cleared on success: normally this component unmounts
    // when the session flips, and if it never does the timer hands the form
    // back instead of leaving it stuck.
    const watchdog = window.setTimeout(() => {
      setSubmitting(false);
      setError(
        "That took longer than expected. Check your connection and try again."
      );
    }, SIGN_IN_TIMEOUT_MS);
    try {
      await signIn("password", {
        email: normalizedEmail,
        password,
        flow: "signIn",
      });
      // On success the auth page redirects to the requested destination.
    } catch (thrown) {
      window.clearTimeout(watchdog);
      setError(authErrorMessage(thrown));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error !== null && (
        <p
          id="signin-error"
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-invalid={error !== null}
          aria-describedby={error !== null ? "signin-error" : undefined}
          className="rounded-10 px-4 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <PasswordInput
          id="signin-password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
          aria-invalid={error !== null}
          aria-describedby={error !== null ? "signin-error" : undefined}
          className="rounded-10 px-4 text-sm"
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
      {!isWebSocketConnected && !submitting && (
        <p role="status" className="text-center text-xs text-label-tertiary">
          Connecting to the server…
        </p>
      )}
    </form>
  );
}
