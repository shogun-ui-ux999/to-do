import { useState, type FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "~/lib/components/ui/button";
import { Input } from "~/lib/components/ui/input";
import { Label } from "~/lib/components/ui/label";
import { PasswordInput } from "~/lib/components/ui/password-input";
import { authErrorMessage } from "~/lib/errors";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    setSubmitting(true);
    try {
      await signIn("password", {
        email: normalizedEmail,
        password,
        flow: "signIn",
      });
      // On success the auth page redirects to the requested destination.
    } catch (thrown) {
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
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
