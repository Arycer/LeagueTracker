"use client";
import React from "react";
import { MessageSquare } from "lucide-react";
import { useChat } from "./ChatContext";

interface ChatButtonProps {
  username: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ username }) => {
  const { openChat } = useChat();

  return (
    <button
      onClick={() => openChat(username)}
      className="chat-trigger p-1 text-blue-400 hover:text-blue-600 transition-colors"
      title={`Chatear con ${username}`}
    >
      <MessageSquare size={16} />
    </button>
  );
};

export default ChatButton;
