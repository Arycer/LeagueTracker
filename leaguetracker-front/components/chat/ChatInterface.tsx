import React, {useEffect, useRef, useState} from 'react';
import {useChatContext} from '@/contexts/ChatContext';
import {useUserContext} from '@/contexts/UserContext';

// Componentes de Shadcn
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

interface ChatInterfaceProps {
  recipientUsername: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ recipientUsername }) => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, activeChat, setActiveChat, loadingHistory, loadChatHistory } = useChatContext();
  const userContext = useUserContext();
  const currentUsername = userContext.user.username;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Activar el chat al montar el componente
  useEffect(() => {
    // Establecer el chat activo
    setActiveChat(recipientUsername);
    
    return () => {
      setActiveChat(null);
    };
  }, [recipientUsername, setActiveChat]);
  
  // Extract complex expression to a separate variable
  const currentChatMessages = messages[recipientUsername];
  const hasMessages = currentChatMessages && currentChatMessages.length > 0;

  // Cargar el historial solo cuando cambia el chat activo
  // y solo si no tenemos mensajes para ese chat
  useEffect(() => {
    // Usamos una variable para rastrear si ya se ha cargado el historial
    // para evitar bucles infinitos
    let isMounted = true;

    const loadHistory = async () => {
      // Solo cargar si es el chat activo, no tenemos mensajes, y el componente sigue montado
      if (isMounted && activeChat === recipientUsername && !hasMessages) {
        try {
          await loadChatHistory(recipientUsername);
        } catch (error) {
          console.error('Error al cargar el historial de chat:', error);
        }
      }
    };

    loadHistory();

    // Función de limpieza para evitar actualizaciones de estado en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, [activeChat, recipientUsername, loadChatHistory, hasMessages]);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const success = await sendMessage(recipientUsername, message.trim());
    if (success) {
      setMessage('');
    }
  };

  const chatMessages = messages[recipientUsername] || [];

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a]">
      {/* Cabecera del chat */}
      <div className="py-4 px-4 border-b border-[#1e293b] bg-[#0f172a]/80 flex items-center">
        <Avatar className="h-10 w-10 mr-3 border border-[#1e293b]">
          <AvatarImage src={`https://avatar.vercel.sh/${recipientUsername}`} />
          <AvatarFallback className="bg-[#1e293b] text-blue-400">{recipientUsername.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold text-white">{recipientUsername}</h2>
          <p className="text-xs text-blue-400 flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
            En línea
          </p>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-3">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">Cargando mensajes...</p>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-5 bg-[#1e293b]/30 rounded-lg max-w-xs">
              <p className="text-gray-300 mb-2">No hay mensajes aún</p>
              <p className="text-gray-400 text-sm">¡Envía el primero!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-1 w-full">
            {chatMessages.map((msg, index) => {
              const isMe = msg.senderUsername === currentUsername;
              const messageDate = new Date(msg.timestamp);

              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2 w-full`}>
                  <div className="flex items-end gap-2 max-w-[70%]">
                    {!isMe && (
                      <Avatar className="h-7 w-7 mb-0.5 flex-shrink-0">
                        <AvatarImage src={`https://avatar.vercel.sh/${msg.senderUsername}`} />
                        <AvatarFallback>{msg.senderUsername.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="break-words overflow-hidden max-w-full">
                      <div className={`rounded-lg px-3 py-2 break-all hyphens-auto ${isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-[#1e293b] text-white rounded-tl-none'
                      }`}>
                        <span className="whitespace-pre-wrap overflow-wrap-anywhere">{msg.content}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 px-1 text-right">
                        {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {isMe && (
                      <Avatar className="h-7 w-7 mb-0.5 flex-shrink-0">
                        <AvatarImage src={`https://avatar.vercel.sh/${currentUsername}`} />
                        <AvatarFallback>{currentUsername.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Área de entrada de mensaje */}
      <div className="p-3 border-t border-[#1e293b]">
        <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2">
          <Input
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-[#0f172a] border-[#1e293b] text-white h-10 px-4 rounded-full"
          />
          <Button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-full h-10 px-5 flex items-center justify-center"
          >
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;