"use client";
import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { FaCircle, FaTrash } from "react-icons/fa";

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
  const { jwt } = useUserContext();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Record<string, MainLolAccountDto | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!friends || friends.length === 0 || !jwt) {
      setAccounts({});
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all(
      friends.map(friendUsername =>
        callApi(`/lol/accounts/main/${friendUsername}`)
          .then((data: MainLolAccountDto | null) => [friendUsername, data] as const)
          .catch(() => [friendUsername, null] as const)
      )
    ).then(results => {
      const accs: Record<string, MainLolAccountDto | null> = {};
      results.forEach(([username, data]) => {
        accs[username] = data;
      });
      setAccounts(accs);
    }).catch(() => {
      setError('Error loading main accounts.');
    }).finally(() => setLoading(false));
  }, [friends, jwt]);

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
            <button
              title="Eliminar amigo"
              className="ml-auto p-1 text-red-400 hover:text-red-600"
              onClick={() => handleDeleteFriend(username)}
              disabled={isLoading}
            >
              <FaTrash />
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default FriendListWithMainAccounts;
