import type { FunctionReturnType } from "convex/server";
import { api } from "~/convex/_generated/api";

export type Task = FunctionReturnType<typeof api.tasks.list>[number];

export type TaskFilter = "all" | "active" | "completed";

/** How long the undo banner stays up after a delete (matches the server). */
export const UNDO_WINDOW_MS = 5000;

/**
 * Incomplete first, then soonest due date (undated last), then newest.
 * Mirrors the ordering the server applies in `tasks.list` so optimistic
 * updates land in the same place the server will put them.
 */
export function compareTasks(a: Task, b: Task): number {
  if (a.completed !== b.completed) {
    return a.completed ? 1 : -1;
  }
  if (a.dueDate !== b.dueDate) {
    if (a.dueDate === undefined) return 1;
    if (b.dueDate === undefined) return -1;
    return a.dueDate - b.dueDate;
  }
  return b.createdAt - a.createdAt;
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(compareTasks);
}

/** Convert a `<input type="date">` value (local) to the stored timestamp. */
export function timestampFromDateInput(value: string): number | undefined {
  if (value.length === 0) {
    return undefined;
  }
  const time = new Date(`${value}T00:00:00`).getTime();
  return Number.isNaN(time) ? undefined : time;
}

/** Convert a stored timestamp back to a `<input type="date">` value. */
export function dateInputValue(timestamp: number | undefined): string {
  if (timestamp === undefined) {
    return "";
  }
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

const DAY_MS = 86_400_000;
const dueDateFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

export interface DueDateDescription {
  label: string;
  overdue: boolean;
}

/** "Today" / "Tomorrow" / "Mar 4", with overdue detection. */
export function describeDueDate(timestamp: number): DueDateDescription {
  const today = startOfDay(Date.now());
  const due = startOfDay(timestamp);
  const diffDays = Math.round((due - today) / DAY_MS);
  if (diffDays === 0) {
    return { label: "Today", overdue: false };
  }
  if (diffDays === 1) {
    return { label: "Tomorrow", overdue: false };
  }
  if (diffDays === -1) {
    return { label: "Yesterday", overdue: true };
  }
  return {
    label: dueDateFormat.format(new Date(timestamp)),
    overdue: due < today,
  };
}
