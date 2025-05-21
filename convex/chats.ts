import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const getExistingChatBetweenUsers = query({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all chats for user1
    const user1ChatIds = await ctx.db
      .query("chatMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId1))
      .collect()
      .then((members) => members.map((member) => member.chatId));

    // Get all chats for user2
    const user2ChatIds = await ctx.db
      .query("chatMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId2))
      .collect()
      .then((members) => members.map((member) => member.chatId));

    // Find common chat IDs
    const commonChatIds = user1ChatIds.filter((id) =>
      user2ChatIds.includes(id),
    );

    // Get the chats and find the direct chat
    for (const chatId of commonChatIds) {
      const chat = await ctx.db.get(chatId);
      if (chat && chat.chatType === "direct") {
        return chat;
      }
    }

    return null;
  },
});

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
  handler: async (ctx, args): Promise<Id<"chats">> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // For direct chats, check if a chat already exists
    if (args.chatType === "direct" && args.users.length === 2) {
      const existingChat = await ctx.runQuery(
        api.chats.getExistingChatBetweenUsers,
        {
          userId1: args.users[0],
          userId2: args.users[1],
        },
      );

      if (existingChat) {
        return existingChat._id;
      }
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

    // Get other user's name for each chat
    const chatsWithNames = await Promise.all(
      chats.map(async (chat) => {
        const members = await ctx.db
          .query("chatMembers")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .collect();

        const otherMember = members.find((member) => member.userId !== userId);
        if (!otherMember) return chat;

        const otherUser = await ctx.db.get(otherMember.userId);
        if (!otherUser) return chat;

        return {
          ...chat,
          name: otherUser.name || otherUser.email || "Unknown User",
        };
      }),
    );

    return chatsWithNames;
  },
});

export const getOtherUserInChat = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    const members = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    const otherMember = members.find((member) => member.userId !== userId);
    if (!otherMember) {
      throw new Error("Other user not found in chat");
    }

    const otherUser = await ctx.db.get(otherMember.userId);
    if (!otherUser) {
      throw new Error("Other user not found");
    }

    return otherUser;
  },
});
