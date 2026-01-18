import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contacts").collect();
  },
});

export const add = mutation({
  args: {
    person: v.string(),
    platform: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contacts", {
      person: args.person,
      platform: args.platform,
      username: args.username,
    });

    // Add audit log entry
    await ctx.db.insert("auditLog", {
      timestamp: new Date().toISOString(),
      action: "CONTACT",
      details: `Added contact for ${args.person}: ${args.platform} - ${args.username}`,
    });

    return id;
  },
});
