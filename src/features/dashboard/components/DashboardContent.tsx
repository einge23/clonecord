import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { MessageCirclePlus, Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router";

export default function DashboardContent() {
  const chats = useQuery(api.chats.getChatsForUser);
  const users = useQuery(api.users.getUsers);

  const navigate = useNavigate();
  const handleStartChat = (otherUserId: string) => {
    navigate(`/chat/new?userId=${otherUserId}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg text-muted-foreground font-semibold">
          Direct Messages
        </h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="lg" className="h-12 w-12 p-0">
              <MessageCirclePlus className="!h-6 !w-6 text-muted-foreground hovb" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex flex-col gap-2">
              {users?.map((user) => (
                <Button
                  key={user._id}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleStartChat(user._id)}
                >
                  {user.name || user.email}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {!chats || chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <p>No direct messages yet</p>
          <p className="text-sm">
            Click the message button to start a conversation
          </p>
        </div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat._id}
            className="flex items-center justify-between px-4 py-2 hover:bg-accent rounded-md"
          >
            <span>{chat.name}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Users className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
