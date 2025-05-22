"use client";

import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {useWebSocket} from './WebSocketContext';
import {useApi} from '@/hooks/useApi';
import {useToast} from '@/hooks/useToast';
import {useUserContext} from './UserContext';
import {IMessage} from '@stomp/stompjs';

// Definición de tipos
export interface ChatMessage {
  senderUsername: string;
  recipientUsername: string;
  content: string;
  timestamp: number;
}

interface ChatContextType {
  // Estado
  activeChat: string | null;
  messages: Record<string, ChatMessage[]>;
  loadingHistory: boolean;
  unreadMessages: Record<string, number>;
  
  // Acciones
  setActiveChat: (username: string | null) => void;
  sendMessage: (recipientUsername: string, content: string) => Promise<boolean>;
  loadChatHistory: (otherUsername: string) => Promise<void>;
  markMessagesAsRead: (username: string) => void;
}

// Crear el contexto
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Props del proveedor
interface ChatProviderProps {
  children: React.ReactNode;
}

// Proveedor del contexto
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Estado
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});
  
  // Hooks
  const { connected, subscribe, unsubscribe, sendMessage: sendWsMessage } = useWebSocket();
  const { get } = useApi();
  const toast = useToast();
  const userContext = useUserContext();
  
  // Cargar historial de chat
  const loadChatHistory = useCallback(async (otherUsername: string) => {
    const currentUser = userContext.user?.username;
    if (!currentUser) return;
    
    // Usamos una variable local para evitar dependencias circulares
    let isCurrentlyLoading = false;
    
    // Evitar cargar el historial si ya estamos cargando
    if (loadingHistory) return;
    
    setLoadingHistory(true);
    isCurrentlyLoading = true;
    
    try {
      // Usar la URL correcta según el controlador del backend
      const response = await get<ChatMessage[]>(`/api/chat/history/${otherUsername}`);
      
      if (response.ok && response.data) {
        // Ordenar mensajes por timestamp para asegurar que se muestran en orden cronológico
        const sortedMessages = [...response.data].sort((a, b) => a.timestamp - b.timestamp);
        
        // Solo actualizar si hay mensajes
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
        // Solo mostrar error si realmente hay un problema (no mostrar error si simplemente no hay mensajes)
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
  
  // Enviar mensaje
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
      
      // Enviar mensaje a través de WebSocket
      sendWsMessage('/app/chat.sendMessage', message);
      
      // Actualizar estado local inmediatamente
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
  
  // Suscribirse a mensajes entrantes cuando el usuario está autenticado
  useEffect(() => {
    const currentUsername = userContext.user?.username;
    if (!connected || !currentUsername) return;

    // Suscribirse a mensajes personales
    const subscription = subscribe(`/queue/messages-${currentUsername}`, (messageData: IMessage) => {
      // Convertir el mensaje recibido al formato ChatMessage
      try {
        const body = messageData.body;
        const chatMessage: ChatMessage = JSON.parse(body);
        const chatKey = chatMessage.senderUsername;
        
        // Actualizar mensajes
        setMessages(prev => {
          const existingMessages = prev[chatKey] || [];
          const updatedMessages: Record<string, ChatMessage[]> = {
            ...prev,
            [chatKey]: [...existingMessages, chatMessage]
          };
          return updatedMessages;
        });
        
        // Incrementar contador de mensajes no leídos si no es el chat activo
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
  
  // Cambiar chat activo
  const handleSetActiveChat = useCallback((username: string | null) => {
    setActiveChat(username);
    if (username) {
      // Marcar mensajes como leídos cuando se activa un chat
      markMessagesAsRead(username);
      
      // No cargamos el historial aquí para evitar bucles infinitos
      // El efecto en ChatInterface se encargará de cargar el historial cuando sea necesario
    }
  }, []);
  
  // Marcar mensajes como leídos
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

// Hook personalizado para usar el contexto
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext debe ser usado dentro de un ChatProvider');
  }
  return context;
};
