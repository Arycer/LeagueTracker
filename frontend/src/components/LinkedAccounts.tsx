'use client';

import React, { useEffect, useState } from 'react';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

interface LolAccount {
  id: string;
  summonerName: string;
  tagline: string;
  summonerId: string;
  profileIconId: number;
  region: string;
  verified: boolean;
}

const LinkedAccounts: React.FC = () => {
  const fetcher = useAuthenticatedFetch();
  const [accounts, setAccounts] = useState<LolAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const data = await fetcher('http://localhost:8080/lol/accounts/accounts');
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Error al cargar las cuentas');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded">
        {error}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No hay cuentas vinculadas
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tus cuentas vinculadas</h3>
      <div className="space-y-2">
        {accounts.map((account) => (
          <div 
            key={account.id} 
            className="p-3 border rounded-lg bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-medium">
                {account.summonerName}#{account.tagline}
              </div>
              <div className="text-sm text-gray-500">
                {account.region} • {account.verified ? 'Verificada' : 'Pendiente de verificación'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={`https://ddragon.leagueoflegends.com/cdn/13.1.1/img/profileicon/${account.profileIconId}.png`} 
                alt="Profile icon"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkedAccounts;
