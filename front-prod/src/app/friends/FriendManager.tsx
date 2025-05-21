"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

interface FriendRequest {
  id: string;
  requesterUsername: string;
  recipientUsername: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

import { FaUserPlus, FaUserCheck, FaUserTimes } from "react-icons/fa";
import FriendListWithMainAccounts from "./FriendListWithMainAccounts";


export default function FriendManager() {
  const { callApi } = useApi();
  const [friendUsername, setFriendUsername] = useState("");
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Consultar presencia solo cuando cambia la lista de amigos
  useEffect(() => {
    if (friends.length === 0) {
      setOnline({});
      return;
    }
    
    let mounted = true;
    
    const checkPresence = async () => {
      try {
        console.log('FriendManager: Verificando presencia para:', friends);
        
        const presencePromises = friends.map(async (username) => {
          const res = await callApi(`/api/presence/is-online/${username}`);
          return {
            username,
            online: res.ok && res.data && res.data.online
          };
        });
        
        const results = await Promise.all(presencePromises);
        
        if (!mounted) return;
        
        const presence: Record<string, boolean> = {};
        results.forEach(({ username, online }) => {
          presence[username] = online;
        });
        
        console.log('FriendManager: Estado de presencia actualizado:', presence);
        setOnline(presence);
      } catch (err) {
        console.error('Error al verificar presencia:', err);
      }
    };
    
    checkPresence();
    
    return () => {
      mounted = false;
    };
  }, [friends, callApi]);

  const loadData = async () => {
    try {
      console.log('Loading friend data...');
      setIsLoading(true);
      
      const [incomingRes, outgoingRes, friendsListRes] = await Promise.all([
        callApi("/api/friends/requests/incoming"),
        callApi("/api/friends/requests/outgoing"),
        callApi("/api/friends")
      ]);
      
      console.log('Friend data loaded:', { incomingRes, outgoingRes, friendsListRes });
      
      setIncomingRequests(Array.isArray(incomingRes.data) ? incomingRes.data : []);
      setOutgoingRequests(Array.isArray(outgoingRes.data) ? outgoingRes.data : []);
      setFriends(Array.isArray(friendsListRes.data) ? friendsListRes.data : []);
    } catch (error: any) {
      console.error("Error loading friend data:", error);
      setMessage(error.message || "Error loading friend data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendUsername.trim()) return;
    setIsLoading(true);
    const res = await callApi(`/api/friends/requests/${friendUsername}`, "POST");
    if (res.ok) {
      setFriendUsername("");
      await loadData();
      setMessage("Friend request sent!");
    } else {
      setMessage(typeof res.error === 'string' ? res.error : "Failed to send friend request");
    }
    setIsLoading(false);
  };

  const handleRespondRequest = async (requesterUsername: string, accept: boolean) => {
    setIsLoading(true);
    const res = await callApi(`/api/friends/requests/${requesterUsername}/respond?accept=${accept}`, "POST");
    if (res.ok) {
      await loadData();
      setMessage(`Request ${accept ? "accepted" : "rejected"}!`);
    } else {
      setMessage(typeof res.error === 'string' ? res.error : "Failed to respond to request");
    }
    setIsLoading(false);
  };

  const handleDeleteFriend = async (friendUsername: string) => {
    if (!window.confirm(`Are you sure you want to remove this friend?`)) return;
    setIsLoading(true);
    const res = await callApi(`/api/friends/${friendUsername}`, "DELETE");
    if (res.ok) {
      await loadData();
      setMessage("Friend deleted!");
    } else {
      setMessage(typeof res.error === 'string' ? res.error : "Failed to delete friend");
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 px-2 md:px-0">
      {/* Solicitudes entrantes y salientes */}
      <div className="w-full flex flex-col md:flex-row gap-6">
        {/* Solicitudes recibidas */}
        <section className="flex-1 bg-[#26324d]/90 rounded-xl shadow p-4">
          <h2 className="text-base font-bold text-blue-200 mb-2 flex items-center gap-2">
            <FaUserCheck className="text-blue-400" /> Solicitudes recibidas
          </h2>
          {incomingRequests.length === 0 ? (
            <span key="no-incoming-requests" className="text-gray-400">No tienes solicitudes pendientes.</span>
          ) : (
            <ul className="flex flex-col gap-2">
              {incomingRequests.map((req, index) => (
                <li key={req.id || `incoming-${req.requesterUsername}-${index}`} className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
                  <span className="flex-1 text-gray-200 truncate">{req.requesterUsername}</span>
                  <button
                    className="p-1 text-green-400 hover:text-green-600"
                    title="Aceptar"
                    onClick={() => handleRespondRequest(req.requesterUsername, true)}
                    disabled={isLoading}
                  >
                    <FaUserCheck />
                  </button>
                  <button
                    className="p-1 text-red-400 hover:text-red-600"
                    title="Rechazar"
                    onClick={() => handleRespondRequest(req.requesterUsername, false)}
                    disabled={isLoading}
                  >
                    <FaUserTimes />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* Solicitudes enviadas */}
        <section className="flex-1 bg-[#26324d]/90 rounded-xl shadow p-4">
          <h2 className="text-base font-bold text-blue-200 mb-2 flex items-center gap-2">
            <FaUserPlus className="text-blue-400" /> Solicitudes enviadas
          </h2>
          {outgoingRequests.length === 0 ? (
            <span key="no-outgoing-requests" className="text-gray-400">No has enviado solicitudes.</span>
          ) : (
            <ul className="flex flex-col gap-2">
              {outgoingRequests.map((req, index) => (
                <li key={req.id || `outgoing-${req.recipientUsername}-${index}`} className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
                  <span className="flex-1 text-gray-200 truncate">{req.recipientUsername}</span>
                  <span className="text-yellow-400 text-xs font-semibold">Pendiente</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {/* Lista de amigos */}
      <section className="w-full bg-[#26324d]/90 rounded-xl shadow p-4">
        <h2 className="text-lg font-bold text-blue-200 mb-3 flex items-center gap-2">
          <FaUserCheck className="text-blue-400" /> Tus amigos
        </h2>
        {friends.length === 0 ? (
          <span key="no-friends" className="text-gray-400">Todavía no tienes amigos añadidos.</span>
        ) : (
          <FriendListWithMainAccounts
            friends={friends}
            online={online}
            isLoading={isLoading}
            handleDeleteFriend={handleDeleteFriend}
          />
        )}
      </section>
      <section className="w-full bg-[#26324d]/90 rounded-xl shadow p-4">
        <h2 className="text-base font-bold text-blue-200 mb-2 flex items-center gap-2">
          <FaUserPlus className="text-blue-400" /> Añadir amigo
        </h2>
        <form onSubmit={handleSendRequest} className="flex gap-2">
          <input
            type="text"
            value={friendUsername}
            onChange={e => setFriendUsername(e.target.value)}
            placeholder="Nombre de usuario"
            className="flex-1 p-2 border rounded bg-gray-800 text-gray-100"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading || !friendUsername.trim()}
          >
            Enviar
          </button>
        </form>
        {message && (
          <div key="message-notification" className="mt-2 p-2 bg-blue-100 text-blue-800 rounded text-xs">{message}</div>
        )}
      </section>
    </div>
  );
}
