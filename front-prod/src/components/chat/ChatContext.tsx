"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useWebSocket } from "@/context/WebSocketContext";
import { useUserContext } from "@/context/UserContext";
import ChatWindow from "./ChatWindow";

interface Message {
  id?: string;
  senderUsername: string;
  recipientUsername: string;
  content: string;
  timestamp: number;
}

interface ChatContextProps {
  openChat: (username: string) => void;
  closeChat: () => void;
  isOpen: boolean;
  currentFriend: string | null;
  unreadMessages: Record<string, number>;
  markAsRead: (username: string) => void;
}

const ChatContext = createContext<ChatContextProps>({
  openChat: () => {},
  closeChat: () => {},
  isOpen: false,
  currentFriend: null,
  unreadMessages: {},
  markAsRead: () => {}
});

export const useChat = () => useContext(ChatContext);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFriend, setCurrentFriend] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});
  
  const { subscribe } = useWebSocket();
  const { username } = useUserContext();

  // Suscribirse a nuevos mensajes para actualizar el contador de no leídos
  useEffect(() => {
    if (!username || !subscribe) return;
    
    const subscription = subscribe(`/queue/messages-${username}`, (message) => {
      try {
        const msg: Message = JSON.parse(message.body);
        
        // Solo incrementar contador si el chat no está abierto con este usuario
        if (!(isOpen && currentFriend === msg.senderUsername)) {
          setUnreadMessages(prev => ({
            ...prev,
            [msg.senderUsername]: (prev[msg.senderUsername] || 0) + 1
          }));
        }
      } catch (err) {
        console.error('Error parsing message in ChatContext:', err);
      }
    });
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [username, subscribe, isOpen, currentFriend]);

  const openChat = (username: string) => {
    setCurrentFriend(username);
    setIsOpen(true);
    // Marcar mensajes como leídos al abrir el chat
    markAsRead(username);
  };

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);
  
  const markAsRead = (username: string) => {
    setUnreadMessages(prev => {
      const newState = { ...prev };
      delete newState[username];
      return newState;
    });
  };

  // Cerrar chat al hacer clic fuera
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // Si el clic no es dentro del chat o en un botón de chat, cerramos
    if (isOpen && !target.closest('.chat-window') && !target.closest('.chat-trigger')) {
      closeChat();
    }
  }, [isOpen, closeChat]);

  // Añadir/eliminar event listener para clicks fuera
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, handleOutsideClick]);

  return (
    <ChatContext.Provider value={{ openChat, closeChat, isOpen, currentFriend, unreadMessages, markAsRead }}>
      {children}
      {isOpen && currentFriend && (
        <div className="chat-window">
          <ChatWindow 
            friendUsername={currentFriend} 
            onClose={closeChat}
          />
        </div>
      )}
    </ChatContext.Provider>
  );
};
