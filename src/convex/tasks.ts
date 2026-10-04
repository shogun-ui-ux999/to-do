import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

export const TITLE_MAX = 200;
export const UNDO_WINDOW_MS = 5000;

/** Latest due date we accept: 2100-01-01 (server-side guard against nonsense). */
const MAX_DUE_DATE = Date.UTC(2100, 0, 1);

function cleanTitle(raw: string): string {
  const title = raw.trim();
  if (title.length === 0) {
    throw new ConvexError({
      code: "title_empty",
      message: "A title is required.",
    });
  }
  if (title.length > TITLE_MAX) {
    throw new ConvexError({
      code: "title_too_long",
      message: `Titles must be ${TITLE_MAX} characters or fewer.`,
    });
  }
  return title;
}

function cleanDueDate(dueDate: number | undefined): number | undefined {
  if (dueDate === undefined) {
    return undefined;
  }
  if (!Number.isInteger(dueDate) || dueDate < 0 || dueDate > MAX_DUE_DATE) {
    throw new ConvexError({
      code: "due_date_invalid",
      message: "That due date is not a valid date.",
    });
  }
  return dueDate;
}

async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError({
      code: "unauthenticated",
      message: "You need to sign in to do that.",
    });
  }
  return userId;
}

/**
 * Deny by default: every task mutation goes through this check, and a task
 * owned by someone else is reported exactly like a missing one so callers
 * cannot probe for other users' task ids.
 */
async function requireOwnedTask(
  ctx: MutationCtx,
  id: Id<"tasks">
): Promise<Doc<"tasks">> {
  const userId = await requireUserId(ctx);
  const task = await ctx.db.get(id);
  if (task === null || task.owner !== userId) {
    throw new ConvexError({
      code: "task_not_found",
      message: "That task no longer exists.",
    });
  }
  return task;
}

/** Incomplete first, then soonest due date, then newest. */
function compareTasks(a: Doc<"tasks">, b: Doc<"tasks">): number {
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

/** Return the caller's tasks, ordered, with server-only fields stripped. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_owner", (q) => q.eq("owner", userId))
      .collect();
    return tasks
      .filter((task) => task.deletedAt === undefined)
      .sort(compareTasks)
      .map((task) => ({
        _id: task._id,
        _creationTime: task._creationTime,
        title: task.title,
        dueDate: task.dueDate,
        completed: task.completed,
        createdAt: task.createdAt,
      }));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const title = cleanTitle(args.title);
    const dueDate = cleanDueDate(args.dueDate);
    return await ctx.db.insert("tasks", {
      owner: userId,
      title,
      dueDate,
      completed: false,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.string(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const task = await requireOwnedTask(ctx, args.id);
    const title = cleanTitle(args.title);
    const dueDate = cleanDueDate(args.dueDate);
    await ctx.db.patch(task._id, { title, dueDate });
  },
});

export const setCompleted = mutation({
  args: {
    id: v.id("tasks"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const task = await requireOwnedTask(ctx, args.id);
    if (task.completed !== args.completed) {
      await ctx.db.patch(task._id, { completed: args.completed });
    }
  },
});

/**
 * Soft delete: the task disappears immediately and a scheduled job removes it
 * for good after the undo window. `restore` cancels the deletion.
 */
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await requireOwnedTask(ctx, args.id);
    if (task.deletedAt !== undefined) {
      return;
    }
    await ctx.db.patch(task._id, { deletedAt: Date.now() });
    await ctx.scheduler.runAfter(UNDO_WINDOW_MS, internal.tasks.purgeDeleted, {
      id: task._id,
    });
  },
});

export const restore = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await requireOwnedTask(ctx, args.id);
    if (task.deletedAt === undefined) {
      return;
    }
    await ctx.db.patch(task._id, { deletedAt: undefined });
  },
});

export const purgeDeleted = internalMutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    // Only purge if the task is still deleted and the undo window has passed
    // (a restore may have happened after this job was scheduled).
    if (
      task !== null &&
      task.deletedAt !== undefined &&
      Date.now() - task.deletedAt >= UNDO_WINDOW_MS
    ) {
      await ctx.db.delete(task._id);
    }
  },
});
