import { Component, type ReactNode } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "~/lib/components/ui/button";
import { toast } from "~/lib/components/ui/toast";
import { errorMessage } from "~/lib/errors";

function WorkspaceError({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const { signOut } = useAuthActions();
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-10 border border-separator bg-surface p-6 text-center">
        <h1 className="font-display text-xl font-semibold">
          We couldn&apos;t load your list
        </h1>
        <p className="mt-2 text-sm text-label-tertiary">
          {errorMessage(error, "Something went wrong on the way to the server.")}
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={onRetry}>Try again</Button>
          <Button
            variant="ghost"
            onClick={() => {
              void signOut().catch((error: unknown) => {
                toast.error(
                  `Couldn’t sign out — ${errorMessage(error, "please try again.")}`
                );
              });
            }}
          >
            Sign out
          </Button>
        </div>
        <p className="mt-4 text-xs text-label-tertiary">
          Your tasks are safe — this screen only means the last request failed.
        </p>
      </div>
    </div>
  );
}

interface WorkspaceErrorBoundaryProps {
  children: ReactNode;
}

interface WorkspaceErrorBoundaryState {
  error: Error | null;
}

/** Catches render-time failures from reactive queries (Convex rethrows
 * query errors during render) and remounts the workspace when the user
 * retries. */
export class WorkspaceErrorBoundary extends Component<
  WorkspaceErrorBoundaryProps,
  WorkspaceErrorBoundaryState
> {
  state: WorkspaceErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): WorkspaceErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error !== null) {
      return (
        <WorkspaceError
          error={this.state.error}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
