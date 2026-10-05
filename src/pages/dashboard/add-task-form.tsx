import { useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/lib/components/ui/button";
import { Input } from "~/lib/components/ui/input";
import { Label } from "~/lib/components/ui/label";
import { timestampFromDateInput } from "~/lib/tasks";

interface AddTaskFormProps {
  onAdd: (title: string, dueDate: number | undefined) => Promise<boolean>;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      setError("Give the task a title first.");
      titleInputRef.current?.focus();
      return;
    }
    if (trimmed.length > 200) {
      setError("Titles must be 200 characters or fewer.");
      return;
    }
    let parsed: number | undefined;
    if (dueDate.length > 0) {
      parsed = timestampFromDateInput(dueDate);
      if (parsed === undefined) {
        setError("That due date isn’t a real date.");
        return;
      }
    }
    setSubmitting(true);
    let added = false;
    try {
      added = await onAdd(trimmed, parsed);
    } catch {
      // Defensive: the dashboard reports the error; treat as failed save.
      added = false;
    } finally {
      setSubmitting(false);
    }
    if (added) {
      setError(null);
      setTitle("");
      setDueDate("");
      titleInputRef.current?.focus();
    } else {
      // Keep what the user typed so a failed save can simply be retried;
      // the dashboard has already shown the reason in a toast.
      setError("Couldn’t save that task — your text is still here. Try again.");
      titleInputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="group">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Label htmlFor="new-task-title" className="sr-only">
              New task title
            </Label>
            <Input
              id="new-task-title"
              ref={titleInputRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a task…"
              maxLength={200}
              autoComplete="off"
              aria-invalid={error !== null}
              aria-describedby={error !== null ? "new-task-error" : undefined}
              className="rounded-10 px-4 text-sm"
            />
          </div>
          <div className="sm:w-44">
            <Label htmlFor="new-task-due" className="sr-only">
              Due date (optional)
            </Label>
            <Input
              id="new-task-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="rounded-10 px-3 text-sm"
            />
          </div>
          <Button type="submit" className="shrink-0" disabled={submitting}>
            {submitting ? (
              "Adding…"
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Add
              </>
            )}
          </Button>
        </div>
        {error !== null && (
          <p
            id="new-task-error"
            role="alert"
            className="mt-1.5 text-xs text-danger"
          >
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
