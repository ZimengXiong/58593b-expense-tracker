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
    group: v.array(v.string()),
    invoiceId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("expenses", {
      amount: args.amount,
      paidBy: args.paidBy,
      note: args.note,
      group: args.group,
      invoiceId: args.invoiceId,
      createdAt: Date.now(),
    });

    const noteStr = args.note ? ` - "${args.note}"` : "";
    const groupStr = args.group.length === 5 ? " (Team)" : ` (${args.group.join(", ")})`;
    await ctx.db.insert("auditLog", {
      timestamp: new Date().toISOString(),
      action: "ADD",
      details: `${args.paidBy} paid $${args.amount.toFixed(2)}${noteStr}${groupStr}`,
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
      const groupStr = expense.group.length === 5 ? " (Team)" : ` (${expense.group.join(", ")})`;
      await ctx.db.insert("auditLog", {
        timestamp: new Date().toISOString(),
        action: "DELETE",
        details: `Removed: ${expense.paidBy} paid $${expense.amount.toFixed(2)}${noteStr}${groupStr}`,
      });
      await ctx.db.delete(args.id);
    }
  },
});
