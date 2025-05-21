import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createChat = mutation({
  args: {
    name: v.string(),
    users: v.array(v.id("users")),
    createdAt: v.float64(),
    updatedAt: v.float64(),
    messages: v.array(v.id("messages")),
    chatType: v.union(v.literal("direct"), v.literal("group")),
    serverId: v.optional(v.id("servers")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Create the chat
    const chatId = await ctx.db.insert("chats", {
      name: args.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      chatType: args.chatType,
      serverId: args.serverId,
    });

    // Create chat memberships for all users
    await Promise.all(
      args.users.map(async (userId) => {
        await ctx.db.insert("chatMembers", {
          chatId,
          userId,
        });
      }),
    );

    return chatId;
  },
});

export const getChatsForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const userChatIds = await ctx.db
      .query("chatMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
      .then((members) => members.map((member) => member.chatId));

    const chats = await ctx.db
      .query("chats")
      .filter((q) =>
        q.and(
          q.eq(q.field("chatType"), "direct"),
          q.or(...userChatIds.map((id) => q.eq(q.field("_id"), id))),
        ),
      )
      .collect();
    return chats;
  },
});
