import { useParams, useSearchParams } from "react-router";

export default function Conversation() {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  const renderNewConversation = () => {
    return (
      <div>
        <h1>New Conversation with {userId}</h1>
      </div>
    );
  };

  const renderConversation = () => {
    return (
      <div>
        <h1>Conversation {chatId}</h1>
      </div>
    );
  };

  return chatId ? renderConversation() : renderNewConversation();
}
