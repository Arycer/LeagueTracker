"use client";
import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";

interface MainLolAccountDto {
  region: string;
  summonerName: string;
  tagline: string;
  profileIconId: number;
  summonerLevel: number;
}

interface FriendMainAccountsProps {
  friends: string[];
}

const FriendMainAccounts: React.FC<FriendMainAccountsProps> = ({ friends }) => {
  const { callApi } = useApi();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Record<string, MainLolAccountDto | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!friends || friends.length === 0) {
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
  }, [friends]);

  if (!friends || friends.length === 0) return null;

  return (
    <div className="mt-6 mb-2 p-4 rounded-xl shadow bg-[#26324d]/90">
      <h2 className="text-lg font-bold text-blue-200 mb-4 flex items-center gap-2">
        <span className="text-blue-400">🔎</span> Cuentas principales de tus amigos
      </h2>
      {loading && <div className="text-gray-400">Cargando cuentas principales...</div>}
      {error && <div className="text-red-400">{error}</div>}
      <ul className="space-y-3">
        {friends.map(friendUsername => {
          const acc = accounts[friendUsername];
          return (
            <li key={friendUsername} className="flex items-center gap-4 p-2 bg-gray-800/80 rounded">
              <span className="font-bold text-blue-200 min-w-[90px]">{friendUsername}</span>
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
                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    onClick={() => router.push(`/profiles/${acc.region}/${encodeURIComponent(acc.summonerName)}/${encodeURIComponent(acc.tagline)}`)}
                  >
                    Ver Perfil
                  </button>
                </>
              ) : (
                <span className="text-gray-400">No se encontró cuenta principal</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FriendMainAccounts;
