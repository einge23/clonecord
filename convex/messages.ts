import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createMessage = mutation({
  args: {
    content: v.string(),
    recieverId: v.id("users"),
    senderId: v.id("users"),
    createdAt: v.float64(),
    readAt: v.float64(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      recieverId: args.recieverId,
      senderId: userId,
      createdAt: Date.now(),
      readAt: undefined,
    });
    return messageId;
  },
});
