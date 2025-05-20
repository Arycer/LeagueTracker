"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Spinner from "../../components/Spinner";
import { useUserContext } from "../../context/UserContext";
import { useApi } from "../../hooks/useApi";

interface LolAccount {
  id: string;
  summonerName: string;
  tagline: string;
  summonerId: string;
  profileIconId: number;
  region: string;
  verified: boolean;
}

interface MainAccount {
  id: string;
}

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
    verificationResult: "idle" | "success" | "error";
    errorMsg?: string;
  };
};

const LinkedAccounts: React.FC = () => {
  const { lolVersion } = useUserContext();
  const { callApi } = useApi();
  const [accounts, setAccounts] = useState<LolAccount[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingLolAccount[]>([]);
  const [mainAccountId, setMainAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingActionState, setPendingActionState] = useState<PendingActionState>({});

  // Fetch linked accounts
  const fetchAccounts = async () => {
    try {
      console.log('Fetching linked accounts...');
      const data = await callApi("/lol/accounts/accounts");
      console.log('Linked accounts data:', data);
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching linked accounts:', err);
      setError(err.message || "Failed to load accounts");
    }
  };

  // Fetch main account
  const fetchMainAccount = async () => {
    try {
      console.log('Fetching main account...');
      const data = await callApi("/lol/accounts/main");
      console.log('Main account data:', data);
      setMainAccountId(data && data.id ? data.id : null);
    } catch (err: any) {
      console.error("Error fetching main account:", err);
    }
  };

  // Set main account
  const handleSetMain = async (id: string) => {
    setActionLoading(id);
    try {
      console.log(`Setting account ${id} as main...`);
      await callApi(`/lol/accounts/${id}/set-main`, "POST");
      console.log('Main account updated successfully');
      await Promise.all([fetchAccounts(), fetchMainAccount()]);
    } catch (err: any) {
      console.error('Error setting main account:', err);
      setError(err.message || "Failed to set main account");
    } finally {
      setActionLoading("");
    }
  };

  // Fetch pending accounts
  const fetchPendingAccounts = async () => {
    try {
      console.log('Fetching pending accounts...');
      const data = await callApi("/lol/accounts/pending");
      console.log('Pending accounts data:', data);
      setPendingAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error fetching pending accounts:", err);
    }
  };

  // Unlink account
  const handleUnlink = async (id: string) => {
    setActionLoading(id);
    try {
      console.log(`Unlinking account ${id}...`);
      await callApi(`/lol/accounts/${id}`, "DELETE");
      console.log('Account unlinked successfully');
      await fetchAccounts();
    } catch (err: any) {
      console.error('Error unlinking account:', err);
      setError(err.message || "Failed to unlink account");
    } finally {
      setActionLoading("");
    }
  };

  // Cancel pending account
  const handleCancelPending = async (id: string) => {
    setActionLoading(id);
    try {
      console.log(`Canceling pending account ${id}...`);
      await callApi(`/lol/accounts/pending/${id}`, "DELETE");
      console.log('Pending account canceled successfully');
      await fetchPendingAccounts();
    } catch (err: any) {
      console.error('Error canceling pending account:', err);
      setError(err.message || "Failed to cancel pending account");
    } finally {
      setActionLoading("");
    }
  };

  // Verify pending account
  const handleVerifyPending = async (id: string) => {
    setPendingActionState((prev) => ({
      ...prev,
      [id]: { verifying: true, verificationResult: "idle" },
    }));
    try {
      console.log(`Verifying pending account ${id}...`);
      await callApi(`/lol/accounts/pending/${id}/verify`, "POST");
      console.log('Account verified successfully');
      setPendingActionState((prev) => ({
        ...prev,
        [id]: { verifying: false, verificationResult: "success" },
      }));
      await Promise.all([fetchPendingAccounts(), fetchAccounts()]);
    } catch (err: any) {
      console.error('Error verifying account:', err);
      setPendingActionState((prev) => ({
        ...prev,
        [id]: { 
          verifying: false, 
          verificationResult: "error",
          errorMsg: err.message || "No se pudo verificar la cuenta. Asegúrate de tener el icono correcto."
        },
      }));
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      console.log('Cargando datos iniciales de cuentas vinculadas...');
      setLoading(true);
      try {
        await Promise.all([
          fetchAccounts(),
          fetchPendingAccounts(),
          fetchMainAccount(),
        ]);
        console.log('Datos iniciales cargados correctamente');
      } catch (err) {
        console.error('Error cargando datos iniciales:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [callApi]); // Incluir callApi como dependencia para que se actualice si cambia

  return (
    <div className="w-full h-full flex flex-col items-center pt-8 pb-8 px-2 md:px-0 bg-[#232b3a]">
      {loading && <Spinner overlay text="Cargando..." />}
      {!loading && (
        <div className="w-full max-w-lg flex flex-col gap-6 z-10">
          {/* Pending Accounts */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Cuentas pendientes</h3>
            {pendingAccounts.length === 0 ? (
              <div className="text-blue-100 text-center">No hay cuentas pendientes</div>
            ) : (
              <div className="flex flex-col gap-4">
                {pendingAccounts.map((pending) => {
                  const pendingState = pendingActionState[pending.id] || {
                    verifying: false,
                    verificationResult: "idle",
                  };
                  return (
                    <div
                      key={pending.id}
                      className="flex flex-row items-center gap-4 p-4 border-b border-blue-900/40 bg-[#232b3a]"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-700 bg-white flex-shrink-0">
                        {lolVersion && pending.profileIconId ? (
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/profileicon/${pending.profileIconId}.png`}
                            alt="Icono requerido"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">
                          {pending.summonerName}#{pending.tagline}
                        </div>
                        <div className="text-sm text-blue-100 truncate">{pending.region} • Pendiente</div>
                        <div className="text-xs text-blue-400 mt-1">Icono requerido para verificar</div>
                        {pendingState.verificationResult === "success" && (
                          <div className="text-green-400 text-xs mt-1">¡Cuenta verificada!</div>
                        )}
                        {pendingState.verificationResult === "error" && (
                          <div className="text-red-400 text-xs mt-1">{pendingState.errorMsg || "Error al verificar"}</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => handleVerifyPending(pending.id)}
                          disabled={pendingState.verifying}
                          className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {pendingState.verifying ? "Verificando..." : "Verificar"}
                        </button>
                        <button
                          onClick={() => handleCancelPending(pending.id)}
                          disabled={actionLoading === pending.id}
                          className="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === pending.id ? "Cancelando..." : "Cancelar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Linked Accounts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Tus cuentas vinculadas</h3>
              <Link
                href="/linking"
                className="text-blue-400 text-sm hover:underline font-medium"
              >
                Vincular nueva
              </Link>
            </div>
            {accounts.length === 0 ? (
              <div className="text-blue-100 text-center">No hay cuentas vinculadas</div>
            ) : (
              <div className="flex flex-col gap-4">
                {accounts.map((account) => {
                  const isMain = account.id === mainAccountId;
                  return (
                    <div
                      key={account.id}
                      className={`flex flex-row items-center gap-4 p-4 border-b border-blue-900/40 bg-[#232b3a] ${isMain ? "ring-2 ring-blue-500" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white flex items-center gap-2 truncate">
                          {account.summonerName}#{account.tagline}
                          {isMain && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-blue-600 text-white rounded">Principal</span>
                          )}
                        </div>
                        <div className="text-sm text-blue-100 truncate">
                          {account.region} • {account.verified ? "Verificada" : "Pendiente de verificación"}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion || "13.1.1"}/img/profileicon/${account.profileIconId}.png`}
                          alt="Profile icon"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {account.verified && !isMain && (
                          <button
                            onClick={() => handleSetMain(account.id)}
                            disabled={actionLoading === account.id}
                            className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {actionLoading === account.id ? "Cambiando..." : "Marcar como principal"}
                          </button>
                        )}
                        <button
                          onClick={() => handleUnlink(account.id)}
                          disabled={actionLoading === account.id}
                          className="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === account.id ? "Eliminando..." : "Desvincular"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="p-4 text-red-600 bg-red-100 rounded">
          {error}
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center pt-8 pb-8 px-2 md:px-0 bg-[#232b3a]">
      <div className="w-full max-w-lg flex flex-col gap-6 z-10">

        {/* Pending Accounts */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Cuentas pendientes</h3>
          {pendingAccounts.length === 0 ? (
            <div className="text-blue-100 text-center">No hay cuentas pendientes</div>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingAccounts.map((pending) => {
                const pendingState = pendingActionState[pending.id] || {
                  verifying: false,
                  verificationResult: "idle",
                };
                return (
                  <div
                    key={pending.id}
                    className="flex flex-row items-center gap-4 p-4 border-b border-blue-900/40 bg-[#232b3a]"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-700 bg-white flex-shrink-0">
                      {lolVersion && pending.profileIconId ? (
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/profileicon/${pending.profileIconId}.png`}
                          alt="Icono requerido"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {pending.summonerName}#{pending.tagline}
                      </div>
                      <div className="text-sm text-blue-100 truncate">{pending.region} • Pendiente</div>
                      <div className="text-xs text-blue-400 mt-1">Icono requerido para verificar</div>
                      {pendingState.verificationResult === "success" && (
                        <div className="text-green-400 text-xs mt-1">¡Cuenta verificada!</div>
                      )}
                      {pendingState.verificationResult === "error" && (
                        <div className="text-red-400 text-xs mt-1">{pendingState.errorMsg || "Error al verificar"}</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => handleVerifyPending(pending.id)}
                        disabled={pendingState.verifying}
                        className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {pendingState.verifying ? "Verificando..." : "Verificar"}
                      </button>
                      <button
                        onClick={() => handleCancelPending(pending.id)}
                        disabled={actionLoading === pending.id}
                        className="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === pending.id ? "Cancelando..." : "Cancelar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Linked Accounts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Tus cuentas vinculadas</h3>
            <Link
              href="/linking"
              className="text-blue-400 text-sm hover:underline font-medium"
            >
              Vincular nueva
            </Link>
          </div>
          {accounts.length === 0 ? (
            <div className="text-blue-100 text-center">No hay cuentas vinculadas</div>
          ) : (
            <div className="flex flex-col gap-4">
              {accounts.map((account) => {
                const isMain = account.id === mainAccountId;
                return (
                  <div
                    key={account.id}
                    className={`flex flex-row items-center gap-4 p-4 border-b border-blue-900/40 bg-[#232b3a] ${isMain ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white flex items-center gap-2 truncate">
                        {account.summonerName}#{account.tagline}
                        {isMain && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-blue-600 text-white rounded">Principal</span>
                        )}
                      </div>
                      <div className="text-sm text-blue-100 truncate">
                        {account.region} • {account.verified ? "Verificada" : "Pendiente de verificación"}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion || "13.1.1"}/img/profileicon/${account.profileIconId}.png`}
                        alt="Profile icon"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {account.verified && !isMain && (
                        <button
                          onClick={() => handleSetMain(account.id)}
                          disabled={actionLoading === account.id}
                          className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {actionLoading === account.id ? "Cambiando..." : "Marcar como principal"}
                        </button>
                      )}
                      <button
                        onClick={() => handleUnlink(account.id)}
                        disabled={actionLoading === account.id}
                        className="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === account.id ? "Eliminando..." : "Desvincular"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedAccounts;
