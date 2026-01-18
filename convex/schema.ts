import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  expenses: defineTable({
    amount: v.number(),
    paidBy: v.string(),
    note: v.string(),
    createdAt: v.number(),
  }),

  contacts: defineTable({
    person: v.string(),
    platform: v.string(),
    username: v.string(),
  }),

  auditLog: defineTable({
    timestamp: v.string(),
    action: v.string(),
    details: v.string(),
  }),
});
