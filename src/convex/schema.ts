import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  tasks: defineTable({
    owner: v.id("users"),
    title: v.string(),
    dueDate: v.optional(v.number()),
    completed: v.boolean(),
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_owner", ["owner"]),
});
