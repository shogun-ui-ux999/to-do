import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Check, Undo2 } from "lucide-react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Button } from "~/lib/components/ui/button";
import { toast } from "~/lib/components/ui/toast";
import { errorMessage } from "~/lib/errors";
import { cn } from "~/lib/tokens";
import {
  UNDO_WINDOW_MS,
  sortTasks,
  type Task,
  type TaskFilter,
} from "~/lib/tasks";
import { markIntentionalSignOut } from "~/components/require-auth";
import { AddTaskForm } from "./add-task-form";
import { WorkspaceErrorBoundary } from "./error-boundary";
import { TaskRow } from "./task-row";

interface PendingUndo {
  id: Id<"tasks">;
  title: string;
  deadline: number;
}

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

export function Dashboard() {
  return (
    <WorkspaceErrorBoundary>
      <Workspace />
    </WorkspaceErrorBoundary>
  );
}

function Workspace() {
  const { signOut } = useAuthActions();
  const tasks = useQuery(api.tasks.list);

  const [filter, setFilter] = useState<TaskFilter>("all");
  const [undo, setUndo] = useState<PendingUndo | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const createTask = useMutation(api.tasks.create).withOptimisticUpdate(
    (store, args) => {
      const current = store.getQuery(api.tasks.list, {});
      if (current === undefined) {
        return;
      }
      const now = Date.now();
      const optimistic: Task = {
        _id: crypto.randomUUID() as Id<"tasks">,
        _creationTime: now,
        title: args.title.trim(),
        dueDate: args.dueDate,
        completed: false,
        createdAt: now,
      };
      store.setQuery(api.tasks.list, {}, sortTasks([...current, optimistic]));
    }
  );

  const updateTask = useMutation(api.tasks.update).withOptimisticUpdate(
    (store, args) => {
      const current = store.getQuery(api.tasks.list, {});
      if (current === undefined) {
        return;
      }
      store.setQuery(
        api.tasks.list,
        {},
        sortTasks(
          current.map((task) =>
            task._id === args.id
              ? { ...task, title: args.title.trim(), dueDate: args.dueDate }
              : task
          )
        )
      );
    }
  );

  const setCompleted = useMutation(api.tasks.setCompleted).withOptimisticUpdate(
    (store, args) => {
      const current = store.getQuery(api.tasks.list, {});
      if (current === undefined) {
        return;
      }
      store.setQuery(
        api.tasks.list,
        {},
        sortTasks(
          current.map((task) =>
            task._id === args.id
              ? { ...task, completed: args.completed }
              : task
          )
        )
      );
    }
  );

  const removeTask = useMutation(api.tasks.remove).withOptimisticUpdate(
    (store, args) => {
      const current = store.getQuery(api.tasks.list, {});
      if (current === undefined) {
        return;
      }
      store.setQuery(
        api.tasks.list,
        {},
        current.filter((task) => task._id !== args.id)
      );
    }
  );

  const restoreTask = useMutation(api.tasks.restore);

  // Tick the countdown while the undo banner is visible.
  useEffect(() => {
    if (undo === null) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [undo]);

  // Hide the banner once the server-side undo window closes.
  useEffect(() => {
    if (undo !== null && now >= undo.deadline) {
      setUndo(null);
    }
  }, [undo, now]);

  const counts = useMemo(() => {
    const list = tasks ?? [];
    const completed = list.filter((task) => task.completed).length;
    return { all: list.length, active: list.length - completed, completed };
  }, [tasks]);

  const visible = useMemo(() => {
    const list = tasks ?? [];
    if (filter === "active") {
      return list.filter((task) => !task.completed);
    }
    if (filter === "completed") {
      return list.filter((task) => task.completed);
    }
    return list;
  }, [tasks, filter]);

  const handleAdd = (title: string, dueDate: number | undefined) => {
    void createTask({ title, dueDate }).catch((error: unknown) => {
      toast.error(
        `Couldn’t save “${title}” — ${errorMessage(error, "please try again.")}`
      );
    });
  };

  const handleToggle = (task: Task, completed: boolean) => {
    void setCompleted({ id: task._id, completed }).catch((error: unknown) => {
      toast.error(
        `Couldn’t update “${task.title}” — ${errorMessage(error, "please try again.")}`
      );
    });
  };

  const handleSave = (task: Task, title: string, dueDate: number | undefined) => {
    void updateTask({ id: task._id, title, dueDate }).catch((error: unknown) => {
      toast.error(
        `Couldn’t save “${title}” — ${errorMessage(error, "please try again.")}`
      );
    });
  };

  const handleDelete = (task: Task) => {
    setUndo({ id: task._id, title: task.title, deadline: Date.now() + UNDO_WINDOW_MS });
    void removeTask({ id: task._id }).catch((error: unknown) => {
      setUndo(null);
      toast.error(
        `Couldn’t delete “${task.title}” — ${errorMessage(error, "please try again.")}`
      );
    });
  };

  const handleUndo = () => {
    if (undo === null) {
      return;
    }
    const pending = undo;
    setUndo(null);
    void restoreTask({ id: pending.id })
      .then(() => toast.success("Task restored"))
      .catch((error: unknown) => {
        toast.error(
          `Couldn’t restore that task — ${errorMessage(error, "it may already have been removed.")}`
        );
      });
  };

  const handleSignOut = () => {
    markIntentionalSignOut();
    void signOut().then(() => toast.success("Signed out"));
  };

  const remaining = undo === null ? 0 : Math.max(0, undo.deadline - now);
  const secondsLeft = Math.ceil(remaining / 1000);

  return (
    <div className="min-h-screen bg-bg pb-28">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-on-accent shadow-sm"
              aria-hidden="true"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Tally
            </span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-4">
          <AddTaskForm onAdd={handleAdd} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Your list
          </h1>
          {tasks === undefined ? (
            <span className="text-sm text-muted" role="status">
              Loading…
            </span>
          ) : (
            <p className="text-sm text-muted">
              {counts.active} active · {counts.completed} done
            </p>
          )}
        </div>

        <div className="mt-5 mb-5 flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => {
            const selected = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                  selected
                    ? "border-text bg-text text-bg"
                    : "border-border bg-surface text-muted hover:border-text/30 hover:text-text"
                )}
              >
                {label}{" "}
                <span className="tabular-nums opacity-70">
                  {tasks === undefined ? "–" : counts[key]}
                </span>
              </button>
            );
          })}
        </div>

        {tasks === undefined ? (
          <TaskSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <ul className="space-y-2">
            {visible.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </main>

      {undo !== null && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-6 z-30 flex justify-center px-4"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-float animate-slide-in">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Task deleted</p>
                <p className="truncate text-xs text-muted">
                  “{undo.title}” will be removed for good in {secondsLeft}s.
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={handleUndo}>
                <Undo2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Undo
              </Button>
            </div>
            <div className="h-1 bg-surface-2" aria-hidden="true">
              <div
                className="h-full bg-accent transition-[width] duration-100 ease-linear"
                style={{ width: `${(remaining / UNDO_WINDOW_MS) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div aria-hidden="true">
      <ul className="space-y-2">
        {[0, 1, 2].map((index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5"
          >
            <span className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded-[5px] bg-surface-2" />
            <span className="flex-1 space-y-2">
              <span className="block h-3.5 w-2/3 animate-pulse rounded bg-surface-2" />
              <span className="block h-3 w-24 animate-pulse rounded bg-surface-2" />
            </span>
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status">
        Loading your tasks…
      </p>
    </div>
  );
}

function EmptyState({ filter }: { filter: TaskFilter }) {
  const copy =
    filter === "all"
      ? {
          title: "Nothing on the list yet",
          body: "Add your first task above — it stays here until you finish it.",
        }
      : filter === "active"
        ? {
            title: "Nothing left to do",
            body: "Every task is checked off. Add another or enjoy the quiet.",
          }
        : {
            title: "Nothing checked off yet",
            body: "Finished tasks collect here so you can see what you got done.",
          };
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold">{copy.title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{copy.body}</p>
    </div>
  );
}

export default Dashboard;
