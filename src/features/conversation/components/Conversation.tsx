import { useParams, useSearchParams, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function Conversation() {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const currentUser = useQuery(api.users.getMe);
  const messages = useQuery(
    api.messages.getMessagesForChat,
    chatId ? { chatId: chatId as Id<"chats"> } : "skip",
  );
  const otherUser = useQuery(
    api.chats.getOtherUserInChat,
    chatId ? { chatId: chatId as Id<"chats"> } : "skip",
  );
  const createMessage = useMutation(api.messages.createMessage);
  const createChat = useMutation(api.chats.createChat);
  const markChatAsRead = useMutation(api.messages.markChatAsRead);

  // Mark chat as read when viewing messages
  useEffect(() => {
    if (chatId) {
      markChatAsRead({ chatId: chatId as Id<"chats"> });
    }
  }, [chatId, markChatAsRead]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser?._id) return;

    if (chatId && otherUser) {
      // Existing chat
      await createMessage({
        content: message,
        recieverId: otherUser?._id,
        senderId: currentUser._id,
        createdAt: Date.now(),
        readAt: Date.now(),
        chatId: chatId as Id<"chats">,
      });
    } else if (userId) {
      // New chat
      const newChatId = await createChat({
        name: "New Chat",
        users: [userId as Id<"users">, currentUser._id],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        chatType: "direct",
      });
      await createMessage({
        content: message,
        recieverId: userId as Id<"users">,
        senderId: currentUser._id,
        createdAt: Date.now(),
        readAt: Date.now(),
        chatId: newChatId,
      });
      // Navigate to the new chat
      navigate(`/chat/${newChatId}`);
    }
    setMessage("");
  };

  const renderNewConversation = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4">
          <h1 className="text-lg font-semibold mb-4">
            New Conversation with {otherUser?.name || otherUser?.email}
          </h1>
          <div className="space-y-4">
            {messages?.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.senderId === currentUser?._id
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderConversation = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4">
          <h1 className="text-lg font-semibold mb-4">
            {otherUser?.name || otherUser?.email}
          </h1>
          <div className="space-y-4">
            {messages?.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.senderId === currentUser?._id
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return chatId ? renderConversation() : renderNewConversation();
}
