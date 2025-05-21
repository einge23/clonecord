import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const createMessage = mutation({
  args: {
    content: v.string(),
    recieverId: v.id("users"),
    senderId: v.id("users"),
    createdAt: v.float64(),
    readAt: v.float64(),
    chatId: v.id("chats"),
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

    // Update the chat's messages array and lastReadBy
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    const lastReadBy = chat.lastReadBy || {};
    // Only mark as read for the sender
    lastReadBy[userId] = Date.now();

    await ctx.db.patch(args.chatId, {
      messages: [...chat.messages, messageId],
      updatedAt: Date.now(),
      lastReadBy,
    });

    return messageId;
  },
});

export const markChatAsRead = mutation({
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

    const lastReadBy = chat.lastReadBy || {};
    lastReadBy[userId] = Date.now();
    await ctx.db.patch(args.chatId, { lastReadBy });
  },
});

export const getMessagesForChat = query({
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

    const messages = await Promise.all(
      chat.messages.map(async (messageId) => {
        const message = await ctx.db.get(messageId);
        if (!message) return null;
        return message;
      }),
    );

    return messages.filter(
      (message): message is NonNullable<typeof message> => message !== null,
    );
  },
});

export const getUnreadCount = query({
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

    const lastReadTime = chat.lastReadBy?.[userId] || 0;

    const unreadMessages = await Promise.all(
      chat.messages.map(async (messageId) => {
        const message = await ctx.db.get(messageId);
        if (!message) return null;
        return message.createdAt > lastReadTime ? message : null;
      }),
    );

    return unreadMessages.filter(
      (message): message is NonNullable<typeof message> => message !== null,
    ).length;
  },
});

export const getUnreadCounts = query({
  args: {
    chatIds: v.array(v.id("chats")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const counts: Record<string, number> = {};

    for (const chatId of args.chatIds) {
      const chat = await ctx.db.get(chatId);
      if (!chat) continue;

      const lastReadTime = chat.lastReadBy?.[userId] || 0;

      const unreadMessages = await Promise.all(
        chat.messages.map(async (messageId) => {
          const message = await ctx.db.get(messageId);
          if (!message) return null;
          return message.createdAt > lastReadTime ? message : null;
        }),
      );

      counts[chatId] = unreadMessages.filter(
        (message): message is NonNullable<typeof message> => message !== null,
      ).length;
    }

    return counts;
  },
});
