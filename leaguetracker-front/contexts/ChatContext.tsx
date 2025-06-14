"use client";

import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {useWebSocket} from './WebSocketContext';
import {useApi} from '@/hooks/useApi';
import {useToast} from '@/hooks/useToast';
import {useUserContext} from './UserContext';
import {IMessage} from '@stomp/stompjs';


export interface ChatMessage {
  senderUsername: string;
  recipientUsername: string;
  content: string;
  timestamp: number;
}

interface ChatContextType {
  
  activeChat: string | null;
  messages: Record<string, ChatMessage[]>;
  loadingHistory: boolean;
  unreadMessages: Record<string, number>;

  
  setActiveChat: (username: string | null) => void;
  sendMessage: (recipientUsername: string, content: string) => Promise<boolean>;
  loadChatHistory: (otherUsername: string) => Promise<void>;
  markMessagesAsRead: (username: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({children}) => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});

  const {connected, subscribe, unsubscribe, sendMessage: sendWsMessage} = useWebSocket();
  const {get} = useApi();
  const toast = useToast();
  const userContext = useUserContext();

  const loadChatHistory = useCallback(async (otherUsername: string) => {
    const currentUser = userContext.user?.username;
    if (!currentUser) return;

    let isCurrentlyLoading = false;

    if (loadingHistory) return;

    setLoadingHistory(true);
    isCurrentlyLoading = true;

    try {
      const response = await get<ChatMessage[]>(`/api/chat/history/${otherUsername}`);

      if (response.ok && response.data) {
        const sortedMessages = [...response.data].sort((a, b) => a.timestamp - b.timestamp);

        
        if (sortedMessages.length > 0) {
          setMessages(prev => {
            const updatedMessages: Record<string, ChatMessage[]> = {
              ...prev,
              [otherUsername]: sortedMessages
            };
            return updatedMessages;
          });
        }
      } else {
        
        if (response.error) {
          toast.error('Error', `No se pudo cargar el historial de chat con ${otherUsername}`);
        }
      }
    } catch (err) {
      console.error('Error al cargar historial de chat:', err);
      toast.error('Error', `No se pudo cargar el historial de chat con ${otherUsername}`);
    } finally {
      if (isCurrentlyLoading) {
        setLoadingHistory(false);
      }
    }
  }, [get, userContext.user?.username, toast]);

  
  const sendMessage = useCallback(async (recipientUsername: string, content: string): Promise<boolean> => {
    const currentUsername = userContext.user?.username;
    if (!connected || !currentUsername) {
      toast.error('Error', 'No estás conectado al servidor');
      return false;
    }

    try {
      const message: ChatMessage = {
        senderUsername: currentUsername,
        recipientUsername,
        content,
        timestamp: Date.now()
      };

      
      sendWsMessage('/app/chat.sendMessage', message);

      
      setMessages(prev => {
        const existingMessages = prev[recipientUsername] || [];
        const updatedMessages: Record<string, ChatMessage[]> = {
          ...prev,
          [recipientUsername]: [...existingMessages, message]
        };
        return updatedMessages;
      });

      return true;
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      toast.error('Error', `No se pudo enviar el mensaje a ${recipientUsername}`);
      return false;
    }
  }, [connected, sendWsMessage]);

  
  useEffect(() => {
    const currentUsername = userContext.user?.username;
    if (!connected || !currentUsername) return;

    
    const subscription = subscribe(`/queue/messages-${currentUsername}`, (messageData: IMessage) => {
      
      try {
        const body = messageData.body;
        const chatMessage: ChatMessage = JSON.parse(body);
        const chatKey = chatMessage.senderUsername;

        
        setMessages(prev => {
          const existingMessages = prev[chatKey] || [];
          const updatedMessages: Record<string, ChatMessage[]> = {
            ...prev,
            [chatKey]: [...existingMessages, chatMessage]
          };
          return updatedMessages;
        });

        
        if (activeChat !== chatKey) {
          setUnreadMessages(prev => ({
            ...prev,
            [chatKey]: (prev[chatKey] || 0) + 1
          }));
        }
      } catch (err) {
        console.error('Error al procesar mensaje recibido:', err);
      }
    });

    return () => {
      if (currentUsername && subscription) {
        unsubscribe(subscription);
      }
    };
  }, [connected, userContext.user?.username, subscribe, unsubscribe]);

  
  const handleSetActiveChat = useCallback((username: string | null) => {
    setActiveChat(username);
    if (username) {
      
      markMessagesAsRead(username);

      
      
    }
  }, []);

  
  const markMessagesAsRead = useCallback((username: string) => {
    setUnreadMessages(prev => ({
      ...prev,
      [username]: 0
    }));
  }, []);

  const value = {
    activeChat,
    messages,
    loadingHistory,
    unreadMessages,
    setActiveChat: handleSetActiveChat,
    sendMessage,
    loadChatHistory,
    markMessagesAsRead
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};


export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext debe ser usado dentro de un ChatProvider');
  }
  return context;
};
