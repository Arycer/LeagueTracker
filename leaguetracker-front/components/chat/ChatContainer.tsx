"use client";
import React, {Suspense, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

const ChatContainerContent: React.FC<{
  selectedChat: string | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<string | null>>
}> = ({selectedChat, setSelectedChat}) => {
  const searchParams = useSearchParams();
  const [isMobileView, setIsMobileView] = useState(false);

  // Detectar si estamos en vista móvil al cargar y cuando cambia el tamaño de la ventana
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768); // md breakpoint en Tailwind
    };
    
    // Comprobar al inicio
    checkMobileView();
    
    // Comprobar cuando cambia el tamaño de la ventana
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    const username = searchParams.get("username");
    if (username) {
      setSelectedChat(username);
    }
  }, [searchParams, setSelectedChat]);

  // Función para volver a la lista de chats en móvil
  const handleBackToList = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Lista de chats - visible en desktop o en móvil cuando no hay chat seleccionado */}
      <div className={`${isMobileView ? 'w-full' : 'w-72'} h-full border-r border-[#1e293b] ${isMobileView && selectedChat ? 'hidden' : 'block'}`}>
        <ChatList onSelectChat={setSelectedChat}/>
      </div>

      {/* Interfaz de chat - visible en desktop o en móvil cuando hay chat seleccionado */}
      <div className={`flex-1 h-full overflow-hidden ${isMobileView && !selectedChat ? 'hidden' : 'block'}`}>
        {selectedChat ? (
          <div className="flex flex-col h-full">
            {/* Botón de regreso en móvil */}
            {isMobileView && (
              <div className="py-2 px-3 bg-[#0f172a]/90 border-b border-[#1e293b]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-300 hover:text-white hover:bg-blue-500/10 flex items-center gap-1"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver a chats</span>
                </Button>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <ChatInterface recipientUsername={selectedChat}/>
            </div>
          </div>
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

const ChatContainer: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <Suspense fallback={<div>Cargando chats...</div>}>
      <ChatContainerContent selectedChat={selectedChat} setSelectedChat={setSelectedChat}/>
    </Suspense>
  );
};

export default ChatContainer;
