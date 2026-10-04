import { useState, type FormEvent } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Button } from "~/lib/components/ui/button";
import { Checkbox } from "~/lib/components/ui/checkbox";
import { Input } from "~/lib/components/ui/input";
import { cn } from "~/lib/tokens";
import {
  dateInputValue,
  describeDueDate,
  timestampFromDateInput,
  type Task,
} from "~/lib/tasks";

interface TaskRowProps {
  task: Task;
  onToggle: (task: Task, completed: boolean) => void;
  onSave: (task: Task, title: string, dueDate: number | undefined) => void;
  onDelete: (task: Task) => void;
}

export function TaskRow({ task, onToggle, onSave, onDelete }: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftDue, setDraftDue] = useState(dateInputValue(task.dueDate));
  const [editError, setEditError] = useState<string | null>(null);

  const startEditing = () => {
    setDraftTitle(task.title);
    setDraftDue(dateInputValue(task.dueDate));
    setEditError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditError(null);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draftTitle.trim();
    if (trimmed.length === 0) {
      setEditError("A title is required.");
      return;
    }
    if (trimmed.length > 200) {
      setEditError("Titles must be 200 characters or fewer.");
      return;
    }
    const due = draftDue.length > 0 ? timestampFromDateInput(draftDue) : undefined;
    if (draftDue.length > 0 && due === undefined) {
      setEditError("That due date isn’t a real date.");
      return;
    }
    onSave(task, trimmed, due);
    setEditing(false);
    setEditError(null);
  };

  const due = task.dueDate !== undefined ? describeDueDate(task.dueDate) : null;

  if (editing) {
    return (
      <li className="flex items-start gap-2 py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <Input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            maxLength={200}
            autoFocus
            aria-label={`Title for “${task.title}”`}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                cancelEditing();
              }
            }}
          />
          <Input
            type="date"
            value={draftDue}
            onChange={(event) => setDraftDue(event.target.value)}
            className="sm:w-44"
            aria-label={`Due date for “${task.title}”`}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Button type="submit" size="sm">
            Save
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={cancelEditing}>
            Cancel
          </Button>
          {editError !== null && (
            <p role="alert" className="text-xs text-danger">
              {editError}
            </p>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 py-2">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => onToggle(task, checked === true)}
        aria-label={
          task.completed
            ? `Mark “${task.title}” as not done`
            : `Mark “${task.title}” as done`
        }
        className="mt-0.5 flex-none"
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-6",
            task.completed
              ? "text-label-secondary line-through"
              : "text-label"
          )}
        >
          {task.title}
        </p>
        {due !== null && task.dueDate !== undefined && (
          <p
            className={cn(
              "mt-0.5 flex flex-wrap items-center gap-1 text-xs",
              due.overdue && !task.completed ? "text-danger" : "text-label-tertiary"
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Due{" "}
            <time dateTime={new Date(task.dueDate).toISOString()}>
              {due.label}
            </time>
            {due.overdue && !task.completed && (
              <span className="font-medium">· Overdue</span>
            )}
          </p>
        )}
      </div>

      <div className="flex flex-none items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit “${task.title}”`}
          onClick={startEditing}
          className="rounded-md p-1.5 text-label-tertiary transition-colors hover:bg-surface-2 hover:text-label focus-visible:ring-inset focus-visible:ring-accent"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete “${task.title}”`}
          onClick={() => onDelete(task)}
          className="rounded-md p-1.5 text-label-tertiary transition-colors hover:bg-surface-2 hover:text-danger focus-visible:ring-inset focus-visible:ring-accent"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
