import React, { useEffect, useState } from 'react';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';
import { useRouter } from 'next/navigation';

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
    const fetcher = useAuthenticatedFetch();
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
                fetcher(`http://localhost:8080/lol/accounts/main/${friendUsername}`)
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
        <div className="mt-10 p-4 border rounded bg-white">
            <h2 className="text-xl font-semibold mb-4">Cuentas principales de tus amigos</h2>
            {loading && <div className="text-gray-500">Cargando cuentas principales...</div>}
            {error && <div className="text-red-600">{error}</div>}
            <ul className="space-y-3">
                {friends.map(friendUsername => {
                    const acc = accounts[friendUsername];
                    return (
                        <li key={friendUsername} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                            <span className="font-bold text-blue-700">{friendUsername}</span>
                            {acc ? (
                                <>
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${acc.profileIconId}.png`} alt="icon" className="w-8 h-8 rounded-full border" />
                                    <span>{acc.summonerName}#{acc.tagline} ({acc.region})</span>
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
