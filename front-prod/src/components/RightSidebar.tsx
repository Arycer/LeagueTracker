"use client";
import React from "react";
import { BaseSidebar } from "./BaseSidebar";
import Link from "next/link";

interface SidebarProps {
  className?: string;
}

import { useEffect, useState, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { FaCircle } from "react-icons/fa";
import { useWebSocket } from "../context/WebSocketContext";
import { useUserContext } from "../context/UserContext";
import { useChat } from "./chat/ChatContext";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export const RightSidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const { callApi } = useApi();
  const [friends, setFriends] = useState<string[]>([]);
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const { subscribe } = useWebSocket();
  const { openChat, unreadMessages } = useChat();
  const { userId } = useAuth();

  // Solo cargar amigos al montar y si hay un usuario autenticado
  useEffect(() => {
    // Si no hay usuario autenticado, no hacemos nada
    if (!userId) {
      setFriends([]);
      return;
    }
    
    let mounted = true;
    
    const loadFriends = async () => {
      console.log('RightSidebar: Cargando lista de amigos...');
      try {
        const res = await callApi("/api/friends");
        if (mounted) {
          console.log('RightSidebar: Amigos cargados:', res);
          setFriends(Array.isArray(res.data) ? res.data : []);
          if (!res.ok) {
            console.error("RightSidebar: Error loading friends:", res.error);
          }
        }
      } catch (error) {
        console.log('Error al cargar amigos, posiblemente no autenticado');
      }
    };
    
    loadFriends();
    
    return () => {
      mounted = false;
    };
  }, [callApi, userId]);

  // Consultar presencia solo cuando cambia la lista de amigos
  useEffect(() => {
    if (friends.length === 0) {
      setOnline({});
      return;
    }
    
    let mounted = true;
    
    const checkPresence = async () => {
      console.log('Verificando presencia para:', friends);
      
      const presencePromises = friends.map(async (username) => {
        const res = await callApi(`/api/presence/is-online/${username}`);
        return {
          username,
          online: res.ok && res.data && !!res.data.online
        };
      });
      
      const results = await Promise.all(presencePromises);
      
      if (!mounted) return;
      
      const presence: Record<string, boolean> = {};
      results.forEach(({ username, online }) => {
        presence[username] = online;
      });
      
      console.log('Estado de presencia actualizado:', presence);
      setOnline(presence);
    };
    
    checkPresence();
    
    return () => {
      mounted = false;
    };
  }, [friends, callApi]);

  // Suscribirse a presence-updates para actualizar en tiempo real
  const handlePresenceUpdate = useCallback((msg: any) => {
    try {
      const body = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body;
      if (!body || !body.username || !body.event) return;
      setOnline((prev) => {
        if (!friends.includes(body.username)) return prev;
        return {
          ...prev,
          [body.username]: body.event === 'connected',
        };
      });
    } catch (e) {
      // ignore
    }
  }, [friends]);

  useEffect(() => {
    const sub = subscribe && subscribe('/topic/presence-updates', handlePresenceUpdate);
    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [subscribe, handlePresenceUpdate]);

  const onlineCount = friends.filter((u) => online[u]).length;

  const { lolVersion } = useUserContext();

  return (
    <BaseSidebar className={className + " flex flex-col h-full min-h-0"}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-center w-full mb-4">
          <Link href="/friends" className="text-blue-200 font-bold text-lg">
            Amigos
          </Link>
        </div>
        
        {!userId ? (
          // Usuario no autenticado
          <div className="flex flex-col items-center justify-center w-full">
            <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 transition-colors text-center">
              Inicia sesión
            </Link>
          </div>
        ) : (
          // Usuario autenticado
          <>
            <div className="text-gray-300 text-sm mb-2 text-center">
              <span className="flex items-center justify-center gap-1">
                <FaCircle size={8} color="#22c55e" /> {onlineCount} conectados
              </span>
            </div>
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0">
              {friends.length === 0 && <span className="text-gray-500 text-center">Sin amigos</span>}
              {friends.map((username) => (
                <div key={username} className="flex items-center justify-between gap-2 p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors group">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FaCircle size={10} color={online[username] ? "#22c55e" : "#64748b"} />
                    <div className="flex-1 min-w-0">
                      <span className="text-white hover:text-blue-300 transition-colors truncate block">{username}</span>
                      {unreadMessages[username] > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 inline-flex">
                          {unreadMessages[username] > 99 ? '99+' : unreadMessages[username]}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => openChat(username)}
                    className="chat-trigger text-blue-400 hover:text-blue-300 transition-colors p-1"
                    title={`Chatear con ${username}`}
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="sticky bottom-0 w-full text-center text-[11px] text-gray-400 pt-2 pb-1 select-none border-t border-gray-700 bg-transparent z-10">
        Versión de LoL: {lolVersion || '...'}
      </div>
    </BaseSidebar>
  );
};
