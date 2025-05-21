import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    status: v.optional(
      v.union(
        v.literal("online"),
        v.literal("offline"),
        v.literal("away"),
        v.literal("busy"),
      ),
    ),
    lastSeen: v.optional(v.float64()),
    bio: v.optional(v.string()),
    customStatus: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_status", ["status"]),
  numbers: defineTable({
    value: v.number(),
  }),
  messages: defineTable({
    senderId: v.id("users"),
    recieverId: v.id("users"),
    content: v.string(),
    createdAt: v.float64(),
    readAt: v.optional(v.float64()),
  }),
  chats: defineTable({
    name: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
    messages: v.array(v.id("messages")),
    chatType: v.union(v.literal("direct"), v.literal("group")),
    serverId: v.optional(v.id("servers")),
    lastReadBy: v.optional(v.record(v.id("users"), v.float64())),
  }),
  chatMembers: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_chat", ["chatId"]),
});
