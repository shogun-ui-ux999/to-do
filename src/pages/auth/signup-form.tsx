import { useState, type FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "~/lib/components/ui/button";
import { Input } from "~/lib/components/ui/input";
import { Label } from "~/lib/components/ui/label";
import { PasswordInput } from "~/lib/components/ui/password-input";
import { authErrorMessage } from "~/lib/errors";

export function SignUpForm() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
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
    if (password.length < 8) {
      setError("Passwords must be at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("Those passwords don’t match.");
      return;
    }
    setSubmitting(true);
    try {
      await signIn("password", {
        email: normalizedEmail,
        password,
        flow: "signUp",
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
          id="signup-error"
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-invalid={error !== null}
          aria-describedby={error !== null ? "signup-error" : undefined}
          className="rounded-10 px-4 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          aria-describedby={
            error !== null ? "signup-error" : "signup-password-hint"
          }
          className="rounded-10 px-4 text-sm"
        />
        <p id="signup-password-hint" className="text-xs text-label-tertiary">
          Use at least 8 characters.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-confirmation">Confirm password</Label>
        <PasswordInput
          id="signup-confirmation"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="Type it again"
          aria-invalid={error !== null}
          aria-describedby={error !== null ? "signup-error" : undefined}
          showToggle={false}
          className="rounded-10 px-4 text-sm"
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
