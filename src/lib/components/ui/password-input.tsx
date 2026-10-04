import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "~/lib/tokens";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, showToggle = true, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(
          "h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted transition-shadow focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          showToggle ? "pr-10" : undefined,
          className
        )}
        ref={ref}
        {...props}
      />
      {showToggle && (
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded text-muted hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
