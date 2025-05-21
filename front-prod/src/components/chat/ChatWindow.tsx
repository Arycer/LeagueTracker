"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { useWebSocket } from "@/context/WebSocketContext";
import { useUserContext } from "@/context/UserContext";
import { useApi } from "@/hooks/useApi";

interface Message {
  senderUsername: string;
  recipientUsername: string;
  content: string;
  timestamp: number;
}

interface ChatWindowProps {
  friendUsername: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ friendUsername, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  const { callApi } = useApi();
  const { client, sendMessage, subscribe } = useWebSocket();
  const { username } = useUserContext();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setMessages([]);
    setError(null);
    setLoading(true);
    
    if (!username || !friendUsername) {
      setLoading(false);
      return;
    }
    
    console.log('Intentando cargar historial para:', friendUsername);
    
    // Usar una función asíncrona inmediatamente invocada
    (async () => {
      const res = await callApi(`/api/chat/history/${friendUsername}?page=0&size=50`);
      console.log('Datos recibidos del historial:', res);
      
      if (res.ok && Array.isArray(res.data)) {
        setMessages(res.data);
      } else {
        console.error('Error o formato incorrecto en la respuesta:', res);
        setMessages([]);
        if (!res.ok) {
          setError(typeof res.error === 'string' ? res.error : 'No se pudo cargar el historial del chat');
        }
      }
      setLoading(false);
    })();
  }, [username, friendUsername, callApi]);
  
  useEffect(() => {
    if (!client || !username || !subscribe) return;
    
    const subscription = subscribe(`/queue/messages-${username}`, (message) => {
      try {
        const body: Message = JSON.parse(message.body);
        if (body.senderUsername === friendUsername || body.recipientUsername === friendUsername) {
          setMessages(prev => [...prev, body]);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    });
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [client, username, friendUsername, subscribe]);
  
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [loading]);
  
  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (chatWindowRef.current) {
      const rect = chatWindowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !client || !username || !friendUsername) return;
    
    const newMessage: Message = {
      senderUsername: username,
      recipientUsername: friendUsername,
      content: message.trim(),
      timestamp: Date.now()
    };
    
    sendMessage('/app/chat.sendMessage', newMessage);
    
    setMessages(prev => [...prev, newMessage]);
    setMessage("");
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      ref={chatWindowRef}
      className="fixed w-80 h-96 bg-[#232b3a] rounded-lg shadow-lg flex flex-col z-50 border border-blue-900/40"
      style={{
        left: position.x || 'auto',
        right: position.x ? 'auto' : '1rem',
        top: position.y || 'auto',
        bottom: position.y ? 'auto' : '1rem',
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
    >
      <div 
        className="flex items-center justify-between bg-[#26324d] p-3 rounded-t-lg border-b border-blue-900/40 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-blue-200 font-semibold truncate select-none">{friendUsername}</h3>
        <button 
          onClick={onClose}
          className="text-blue-200 hover:text-white p-1 rounded-full"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading && <div className="text-center text-gray-400 text-sm">Cargando mensajes...</div>}
        {error && <div className="text-center text-red-400 text-sm">{error}</div>}
        {messages.length === 0 && !loading && !error && (
          <div className="text-center text-gray-400 text-sm">No hay mensajes. ¡Envía el primero!</div>
        )}
        {messages.map((msg, index) => {
          const isFromMe = msg.senderUsername === username;
          return (
            <div 
              key={index || `msg-${index}-${msg.timestamp}`} 
              className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  isFromMe 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-xs text-gray-400 mt-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t border-blue-900/40 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button 
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
