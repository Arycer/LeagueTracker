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

import { useLolVersion } from '../context/LolVersionContext'

interface PendingLolAccount {
  id: string;
  summonerName: string;
  tagline: string;
  region: string;
  requestedAt: string;
  profileIconId: number;
}

type PendingActionState = {
  [id: string]: {
    verifying: boolean;
    verificationResult: 'idle' | 'success' | 'error';
    errorMsg?: string;
  }
};

const LinkedAccounts: React.FC = () => {
  const { version: gameVersion, loading: loadingVersion } = useLolVersion();
  const fetcher = useAuthenticatedFetch();
  const [accounts, setAccounts] = useState<LolAccount[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingLolAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingActionState, setPendingActionState] = useState<PendingActionState>({});

  // Cargar cuentas vinculadas
  const fetchAccounts = async () => {
    try {
      const data = await fetcher('http://localhost:8080/lol/accounts/accounts');
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Error al cargar las cuentas');
      console.error('Error fetching accounts:', err);
    }
  };

  // Cargar cuentas pendientes
  const fetchPendingAccounts = async () => {
    try {
      const data = await fetcher('http://localhost:8080/lol/accounts/pending');
      setPendingAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Error al cargar cuentas pendientes');
      console.error('Error fetching pending accounts:', err);
    }
  };

  // Desvincular cuenta
  const handleUnlink = async (id: string) => {
    setActionLoading(id);
    try {
      await fetcher(`http://localhost:8080/lol/accounts/${id}`, {
        method: 'DELETE',
      });
      await fetchAccounts();
    } catch (err: any) {
      setError('Error al desvincular la cuenta');
      console.error('Error unlinking account:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Cancelar cuenta pendiente
  const handleCancelPending = async (id: string) => {
    setActionLoading(id);
    try {
      await fetcher(`http://localhost:8080/lol/accounts/pending/${id}`, {
        method: 'DELETE',
      });
      await fetchPendingAccounts();
    } catch (err: any) {
      setError('Error al cancelar la cuenta pendiente');
      console.error('Error deleting pending account:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Verificar cuenta pendiente
  const handleVerifyPending = async (id: string) => {
    setPendingActionState(prev => ({
      ...prev,
      [id]: { verifying: true, verificationResult: 'idle' }
    }));
    try {
      const response = await fetcher('http://localhost:8080/lol/accounts/verify', {
        method: 'POST',
      });
      if (response.verified) {
        setPendingActionState(prev => ({
          ...prev,
          [id]: { verifying: false, verificationResult: 'success' }
        }));
        // Refrescar cuentas
        await Promise.all([fetchAccounts(), fetchPendingAccounts()]);
      } else {
        setPendingActionState(prev => ({
          ...prev,
          [id]: { verifying: false, verificationResult: 'error', errorMsg: 'No se pudo verificar la cuenta. Asegúrate de tener el icono correcto.' }
        }));
      }
    } catch (err: any) {
      setPendingActionState(prev => ({
        ...prev,
        [id]: { verifying: false, verificationResult: 'error', errorMsg: err.message || 'Error al verificar la cuenta' }
      }));
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAccounts(), fetchPendingAccounts()]).finally(() => setLoading(false));
  }, []);


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

  return (
    <div className="space-y-8">
      {/* Cuentas pendientes */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Cuentas pendientes</h3>
        {pendingAccounts.length === 0 ? (
          <div className="text-gray-500 text-center">No hay cuentas pendientes</div>
        ) : (
          <div className="space-y-2">
            {pendingAccounts.map((pending) => {
              const pendingState = pendingActionState[pending.id] || { verifying: false, verificationResult: 'idle' };
              return (
                <div 
                  key={pending.id}
                  className="p-3 border rounded-lg bg-yellow-50 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400 bg-white flex-shrink-0">
                      {gameVersion && pending.profileIconId ? (
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/profileicon/${pending.profileIconId}.png`}
                          alt="Icono requerido"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {pending.summonerName}#{pending.tagline}
                      </div>
                      <div className="text-sm text-gray-500">{pending.region} • Pendiente</div>
                      <div className="text-xs text-blue-600 mt-1">Icono requerido para verificar</div>
                      {pendingState.verificationResult === 'success' && (
                        <div className="text-green-600 text-xs mt-1">¡Cuenta verificada!</div>
                      )}
                      {pendingState.verificationResult === 'error' && (
                        <div className="text-red-600 text-xs mt-1">{pendingState.errorMsg || 'Error al verificar'}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => handleVerifyPending(pending.id)}
                      disabled={pendingState.verifying}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {pendingState.verifying ? 'Verificando...' : 'Verificar'}
                    </button>
                    <button
                      onClick={() => handleCancelPending(pending.id)}
                      disabled={actionLoading === pending.id}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {actionLoading === pending.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cuentas vinculadas */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Tus cuentas vinculadas</h3>
        {accounts.length === 0 ? (
          <div className="text-gray-500 text-center">No hay cuentas vinculadas</div>
        ) : (
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
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src={`https://ddragon.leagueoflegends.com/cdn/13.1.1/img/profileicon/${account.profileIconId}.png`} 
                      alt="Profile icon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleUnlink(account.id)}
                    disabled={actionLoading === account.id}
                    className="ml-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {actionLoading === account.id ? 'Eliminando...' : 'Desvincular'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedAccounts;
