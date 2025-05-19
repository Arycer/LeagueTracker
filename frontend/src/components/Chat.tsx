'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@clerk/clerk-react';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

type Message = {
  id?: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
}

const WS_URL = 'http://localhost:8080/ws';

interface ChatProps {
  recipientId: string | null;
  onSelectRecipient?: (id: string) => void;
  friends?: string[];
  showFriendList?: boolean;
}

const Chat: React.FC<ChatProps> = ({ 
  recipientId: initialRecipientId, 
  onSelectRecipient,
  friends = [],
  showFriendList = true
}) => {
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(initialRecipientId);
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<Client | null>(null);
  const fetcher = useAuthenticatedFetch();
  const hasLoadedHistory = useRef<Record<string, boolean>>({});

  // Efecto para manejar la conexión WebSocket
  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS(WS_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        console.log('Conectado al WebSocket');

        // Suscribirse a mensajes dirigidos a este usuario
        stompClient.subscribe(`/queue/messages-${userId}`, (message) => {
          const body: Message = JSON.parse(message.body);
          setMessages((prev) => [...prev, body]);
        });
      },
      onStompError: (frame) => {
        console.error('Error STOMP:', frame);
      }
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
      setConnected(false);
    };
  }, [userId]);

  // Función para cargar el historial de mensajes
  const fetchChatHistory = async (otherUserId: string) => {
    if (!userId || hasLoadedHistory.current[otherUserId]) return;
    
    try {
      setIsLoadingHistory(true);
      const history = await fetcher(
        `http://localhost:8080/api/chat/history/${otherUserId}?page=0&size=50`
      );
      
      if (Array.isArray(history)) {
        setMessages(prev => {
          // Filtrar mensajes duplicados
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = history.filter((msg: Message) => !existingIds.has(msg.id));
          return [...prev, ...newMessages].sort((a, b) => a.timestamp - b.timestamp);
        });
        hasLoadedHistory.current[otherUserId] = true;
      }
    } catch (error) {
      console.error('Error al cargar el historial de mensajes:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Efecto para manejar el cambio de destinatario
  useEffect(() => {
    if (selectedRecipient && userId) {
      // Solo cargar el historial si no lo hemos cargado antes
      if (!hasLoadedHistory.current[selectedRecipient]) {
        fetchChatHistory(selectedRecipient);
      }
    } else {
      setMessages([]);
    }
    
    // Limpiar el efecto cuando el componente se desmonte
    return () => {
      // No limpiar los mensajes aquí para mantener la fluidez al cambiar entre chats
    };
  }, [selectedRecipient, userId]);

  // Auto-scroll al último mensaje cuando se cargan mensajes nuevos
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleRecipientSelect = (friendId: string) => {
    setSelectedRecipient(friendId);
    if (onSelectRecipient) {
      onSelectRecipient(friendId);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !clientRef.current || !connected || !userId || !selectedRecipient) return;

    const msg: Message = {
      senderId: userId,
      recipientId: selectedRecipient,
      content: input.trim(),
      timestamp: Date.now()
    };

    clientRef.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(msg)
    });

    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  if (!userId) {
    return <div>Por favor inicia sesión para usar el chat</div>;
  }

  // Mostrar carga mientras se carga el historial
  if (isLoadingHistory) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Vista de selección de amigo
  if (!selectedRecipient && showFriendList) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Selecciona un amigo para chatear</h3>
        <div className="space-y-2">
          {friends.map(friendId => (
            <button
              key={friendId}
              onClick={() => handleRecipientSelect(friendId)}
              className="w-full p-3 text-left hover:bg-gray-100 rounded transition"
            >
              {friendId}
            </button>
          ))}
          {friends.length === 0 && (
            <p className="text-gray-500">Añade amigos para empezar a chatear</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {showFriendList && (
            <button 
              onClick={() => setSelectedRecipient(null)}
              className="mr-2 text-blue-500 hover:text-blue-700"
            >
              ← 
            </button>
          )}
          {selectedRecipient}
        </h3>
      </div>
      <div
        className="border rounded p-3 mb-4 h-64 overflow-y-auto bg-gray-50"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center my-4">No hay mensajes aún</p>
        ) : (
          messages.map((m, i) => (
            <div 
              key={i} 
              className={`mb-3 p-2 rounded-lg max-w-xs ${
                m.senderId === userId 
                  ? 'bg-blue-100 ml-auto' 
                  : 'bg-gray-200 mr-auto'
              }`}
            >
              <div className="font-medium text-sm">
                {m.senderId === userId ? 'Tú' : m.senderId}
              </div>
              <div className="text-gray-800">{m.content}</div>
              {m.timestamp && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Escribe un mensaje..."
          className="flex-1 p-2 border rounded"
          disabled={!connected}
        />
        <button
          onClick={sendMessage}
          disabled={!connected || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
      {!connected && (
        <div className="mt-2 text-sm text-yellow-600">
          Conectando al chat...
        </div>
      )}
    </div>
  );
};

export default Chat;
