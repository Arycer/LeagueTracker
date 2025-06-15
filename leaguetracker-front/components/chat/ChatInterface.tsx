import React, {useEffect, useRef, useState} from 'react';
import {useChatContext} from '@/contexts/ChatContext';
import {useUserContext} from '@/contexts/UserContext';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Send} from "lucide-react";

interface ChatInterfaceProps {
  recipientUsername: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({recipientUsername}) => {
  const [checkedNoMessages, setCheckedNoMessages] = useState(false);
  const [message, setMessage] = useState('');
  const {messages, sendMessage, activeChat, setActiveChat, loadingHistory, loadChatHistory} = useChatContext();
  const userContext = useUserContext();
  const currentUsername = userContext.user.username;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveChat(recipientUsername);

    return () => {
      setActiveChat(null);
      setCheckedNoMessages(false);
    };
  }, [recipientUsername, setActiveChat]);

  const currentChatMessages = messages[recipientUsername];
  const hasMessages = currentChatMessages && currentChatMessages.length > 0;

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (isMounted && activeChat === recipientUsername && !loadingHistory && (!hasMessages && !checkedNoMessages)) {
        try {
          await loadChatHistory(recipientUsername);
          setCheckedNoMessages(true);
        } catch (error) {
          console.error('Error al cargar el historial de chat:', error);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [activeChat, recipientUsername, loadChatHistory, hasMessages, loadingHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
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
      
      <div className="py-3 px-4 border-b border-[#1e293b] bg-[#0f172a]/80 flex items-center">
        <Avatar className="h-10 w-10 mr-3 border border-[#1e293b]">
          <AvatarImage src={`https://avatar.vercel.sh/${recipientUsername}`}/>
          <AvatarFallback
            className="bg-[#1e293b] text-blue-400">{recipientUsername.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <h2 className="text-lg font-semibold text-white truncate">{recipientUsername}</h2>
          <p className="text-xs text-blue-400 flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
            En línea
          </p>
        </div>
      </div>

      
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-2 sm:p-3">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">Cargando mensajes...</p>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-5 bg-[#1e293b]/30 rounded-lg max-w-xs mx-2">
              <p className="text-gray-300 mb-2">No hay mensajes aún</p>
              <p className="text-gray-400 text-sm">¡Envía el primero!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-1 w-full">
            {chatMessages.map((msg, index) => {
              const isMe = msg.senderUsername === currentUsername;
              const messageDate = new Date(msg.timestamp);

              return (
                <div key={index}
                     className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1.5 w-full`}>
                  <div className={`flex items-end gap-1.5 max-w-[80%] sm:max-w-[70%]`}>
                    {!isMe && (
                      <Avatar className="h-6 w-6 sm:h-7 sm:w-7 mb-0.5 flex-shrink-0">
                        <AvatarImage src={`https://avatar.vercel.sh/${msg.senderUsername}`}/>
                        <AvatarFallback>{msg.senderUsername.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="break-words overflow-hidden max-w-full">
                      <div className={`rounded-lg px-3 py-1.5 sm:py-2 break-all hyphens-auto ${isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-[#1e293b] text-white rounded-tl-none'
                      }`}>
                        <span className="whitespace-pre-wrap overflow-wrap-anywhere text-sm sm:text-base">{msg.content}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 px-1 text-right">
                        {messageDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {isMe && (
                      <Avatar className="h-6 w-6 sm:h-7 sm:w-7 mb-0.5 flex-shrink-0">
                        <AvatarImage src={`https://avatar.vercel.sh/${currentUsername}`}/>
                        <AvatarFallback>{currentUsername.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1"/>
          </div>
        )}
      </div>

      
      <div className="p-2 sm:p-3 border-t border-[#1e293b]">
        <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2">
          <Input
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-[#0f172a] border-[#1e293b] text-white h-10 px-4 rounded-full text-sm sm:text-base"
          />
          <Button
            type="submit"
            disabled={!message.trim()}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;