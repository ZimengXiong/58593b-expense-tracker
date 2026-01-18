import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("expenses").order("desc").collect();
  },
});

export const add = mutation({
  args: {
    amount: v.number(),
    paidBy: v.string(),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("expenses", {
      amount: args.amount,
      paidBy: args.paidBy,
      note: args.note,
      createdAt: Date.now(),
    });

    // Add audit log entry
    const noteStr = args.note ? ` - "${args.note}"` : "";
    await ctx.db.insert("auditLog", {
      timestamp: new Date().toISOString(),
      action: "ADD",
      details: `${args.paidBy} paid $${args.amount.toFixed(2)}${noteStr}`,
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const expense = await ctx.db.get(args.id);
    if (expense) {
      const noteStr = expense.note ? ` - "${expense.note}"` : "";
      await ctx.db.insert("auditLog", {
        timestamp: new Date().toISOString(),
        action: "DELETE",
        details: `Removed: ${expense.paidBy} paid $${expense.amount.toFixed(2)}${noteStr}`,
      });
      await ctx.db.delete(args.id);
    }
  },
});
