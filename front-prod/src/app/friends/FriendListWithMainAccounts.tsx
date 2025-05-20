"use client";
import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { FaCircle, FaTrash } from "react-icons/fa";
import ChatButton from "@/components/chat/ChatButton";
import { useAuth } from "@clerk/nextjs";

interface MainLolAccountDto {
  region: string;
  summonerName: string;
  tagline: string;
  profileIconId: number;
  summonerLevel: number;
}

interface FriendListWithMainAccountsProps {
  friends: string[];
  online: Record<string, boolean>;
  isLoading: boolean;
  handleDeleteFriend: (username: string) => void;
}

const FriendListWithMainAccounts: React.FC<FriendListWithMainAccountsProps> = ({ friends, online, isLoading, handleDeleteFriend }) => {
  const { callApi } = useApi();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Record<string, MainLolAccountDto | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!friends || friends.length === 0) {
      setAccounts({});
      return;
    }
    
    console.log('Fetching main accounts for friends:', friends);
    setLoading(true);
    setError(null);
    
    try {
      const promises = friends.map(async (friendUsername) => {
        try {
          const data = await callApi(`/lol/accounts/main/${friendUsername}`);
          return [friendUsername, data] as const;
        } catch (err) {
          console.error(`Error fetching account for ${friendUsername}:`, err);
          return [friendUsername, null] as const;
        }
      });
      
      const results = await Promise.all(promises);
      
      const accs: Record<string, MainLolAccountDto | null> = {};
      results.forEach(([username, data]) => {
        accs[username] = data;
      });
      
      console.log('Loaded accounts:', accs);
      setAccounts(accs);
    } catch (err) {
      console.error('Error loading main accounts:', err);
      setError('Error loading main accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [friends, callApi]);

  if (!friends || friends.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2 w-full">
      {loading && <li key="loading-message" className="text-gray-400">Cargando cuentas principales...</li>}
      {error && <li key="error-message" className="text-red-400">{error}</li>}
      {friends.map((username) => {
        const acc = accounts[username];
        return (
          <li key={username} className="flex items-center gap-3 bg-gray-800 rounded px-3 py-2">
            <FaCircle size={10} color={online[username] ? "#22c55e" : "#64748b"} />
            <span className="font-bold text-blue-200 min-w-[90px]">{username}</span>
            {acc ? (
              <>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${acc.profileIconId}.png`}
                  alt="icon"
                  className="w-8 h-8 rounded-full border"
                />
                <span className="text-gray-100">{acc.summonerName}#{acc.tagline} <span className="text-xs text-blue-300">({acc.region})</span></span>
                <span className="text-xs text-gray-300">Nv. {acc.summonerLevel}</span>
                <button
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                  onClick={() => router.push(`/profiles/${acc.region}/${encodeURIComponent(acc.summonerName)}/${encodeURIComponent(acc.tagline)}`)}
                >
                  Ver Perfil
                </button>
              </>
            ) : (
              <span className="text-gray-400 text-xs">No se encontró cuenta principal</span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <ChatButton username={username} />
              <button
                title="Eliminar amigo"
                className="p-1 text-red-400 hover:text-red-600"
                onClick={() => handleDeleteFriend(username)}
                disabled={isLoading}
              >
                <FaTrash />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default FriendListWithMainAccounts;
