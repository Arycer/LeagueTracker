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

export const RightSidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const { callApi } = useApi();
  const [friends, setFriends] = useState<string[]>([]);
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const { jwt } = useUserContext();
  const { subscribe } = useWebSocket();

  // Solo cargar amigos al montar
  useEffect(() => {
    if (!jwt) return;

    let mounted = true;
    callApi("/api/friends")
      .then((data: string[]) => {
        if (mounted) setFriends(data);
      });
    return () => {
      mounted = false;
    };
    // callApi no debe ir en dependencias para evitar loops infinitos
    // eslint-disable-next-line
  }, [jwt]);

  // Consultar presencia solo cuando cambia la lista de amigos
  useEffect(() => {
    if (friends.length === 0) {
      setOnline({});
      return;
    }
    let mounted = true;
    Promise.all(
      friends.map((username) =>
        callApi(`/api/presence/is-online/${username}`).then((res: any) => ({
          username,
          online: !!res.online,
        }))
      )
    ).then((results) => {
      if (!mounted) return;
      const presence: Record<string, boolean> = {};
      results.forEach(({ username, online }) => {
        presence[username] = online;
      });
      setOnline(presence);
    });
    return () => {
      mounted = false;
    };
  }, [friends]);

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
        <Link href="/friends" className="text-blue-200 font-bold text-lg mb-4">
          Amigos
        </Link>
        <div className="text-gray-300 text-sm mb-2">
          {onlineCount} conectados
        </div>
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0">
          {friends.length === 0 && <span className="text-gray-500">Sin amigos</span>}
          {friends.map((username) => (
            <div key={username} className="flex items-center gap-2">
              <FaCircle size={10} color={online[username] ? "#22c55e" : "#64748b"} />
              <span className="text-gray-200">{username}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 w-full text-center text-[11px] text-gray-400 pt-2 pb-1 select-none border-t border-gray-700 bg-transparent z-10">
        Versión de LoL: {lolVersion || '...'}
      </div>
    </BaseSidebar>
  );
};
