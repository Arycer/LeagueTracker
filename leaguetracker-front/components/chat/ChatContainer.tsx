"use client";
import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import ChatList from './ChatList';
import ChatInterface from './ChatInterface';

const ChatContainer: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  // Efecto para detectar el parámetro de consulta username
  useEffect(() => {
    const username = searchParams.get('username');
    if (username) {
      setSelectedChat(username);
    }
  }, [searchParams]);
  
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Panel lateral de chats - ancho fijo con scroll propio */}
      <div className="w-72 h-full border-r border-[#1e293b]">
        <ChatList onSelectChat={setSelectedChat} />
      </div>
      
      {/* Área de chat - ocupa el resto del espacio disponible */}
      <div className="flex-1 h-full overflow-hidden">
        {selectedChat ? (
          <ChatInterface recipientUsername={selectedChat} />
        ) : (
          <div className="flex items-center justify-center h-full bg-[#0f172a] text-gray-400">
            <div className="text-center p-6 bg-[#1e293b]/30 rounded-lg max-w-md">
              <h3 className="text-xl font-medium text-white mb-3">Selecciona un chat</h3>
              <p className="text-gray-400">Elige un amigo de la lista para iniciar una conversación</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
