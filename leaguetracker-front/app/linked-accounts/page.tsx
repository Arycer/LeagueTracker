"use client";

import React from 'react';
import Link from 'next/link';
import {LolAccount, PendingLolAccount, useLinkedAccounts} from '@/contexts/LinkedAccountsContext';
import {Button} from '@/components/ui/button';
import ProfileIcon from '@/components/ddragon/ProfileIcon';
import {Spinner} from '@/components/ui/spinner';
import {getRegionLabel} from '@/constants/regions';

/**
 * Página de cuentas vinculadas
 * Muestra las cuentas de LoL vinculadas al usuario y permite gestionar las cuentas pendientes
 */
export default function LinkedAccountsPage() {
  const {
    accounts,
    pendingAccounts,
    mainAccountId,
    isLoading,
    error,
    actionLoading,
    pendingActionState,
    setMainAccount,
    unlinkAccount,
    cancelPendingAccount,
    verifyPendingAccount,
    refreshAll
  } = useLinkedAccounts();

  // Renderizar una cuenta vinculada
  const renderAccount = (account: LolAccount) => {
    const isMain = account.id === mainAccountId;

    return (
      <div
        key={account.id}
        className={`flex flex-row items-center gap-4 p-4 border-b border-blue-900/40 bg-[#1e293b]/70 rounded-md ${
          isMain ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        {/* Icono de perfil */}
        <div className="flex-shrink-0">
          <ProfileIcon
            iconId={account.profileIconId}
            size={56}
            withBorder={true}
            alt={`Icono de perfil de ${account.summonerName}`}
          />
        </div>

        {/* Información de la cuenta */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white flex items-center gap-2 truncate">
            {account.summonerName}#{account.tagline}
            {isMain && (
              <span className="inline-block px-2 py-0.5 text-xs bg-blue-600 text-white rounded">
                Principal
              </span>
            )}
          </div>
          <div className="text-sm text-blue-100 truncate">
            {getRegionLabel(account.region)} • {account.verified ? 'Verificada' : 'Pendiente de verificación'}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2 items-end">
          {account.verified && !isMain && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setMainAccount(account.id)}
              disabled={actionLoading === account.id}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {actionLoading === account.id ? 'Cambiando...' : 'Marcar como principal'}
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => unlinkAccount(account.id)}
            disabled={actionLoading === account.id}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {actionLoading === account.id ? 'Eliminando...' : 'Desvincular'}
          </Button>
        </div>
      </div>
    );
  };

  // Renderizar una cuenta pendiente
  const renderPendingAccount = (pending: PendingLolAccount) => {
    const pendingState = pendingActionState[pending.id] || {
      verifying: false,
      verificationResult: 'idle',
    };

    return (
      <div
        key={pending.id}
        className="flex flex-row items-center gap-4 p-4 border-b border-blue-900/40 bg-[#1e293b]/70 rounded-md"
      >
        {/* Icono requerido */}
        <div className="flex-shrink-0">
          <ProfileIcon
            iconId={pending.profileIconId}
            size={56}
            withBorder={true}
            className="border-blue-700 border-2"
            alt="Icono requerido para verificación"
          />
        </div>

        {/* Información de la cuenta pendiente */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">
            {pending.summonerName}#{pending.tagline}
          </div>
          <div className="text-sm text-blue-100 truncate">
            {getRegionLabel(pending.region)} • Pendiente
          </div>
          <div className="text-xs text-blue-400 mt-1">
            Icono requerido para verificar
          </div>
          {pendingState.verificationResult === 'success' && (
            <div className="text-green-400 text-xs mt-1">
              ¡Cuenta verificada!
            </div>
          )}
          {pendingState.verificationResult === 'error' && (
            <div className="text-red-400 text-xs mt-1">
              {pendingState.errorMsg || 'Error al verificar'}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2 items-end">
          <Button
            variant="default"
            size="sm"
            onClick={() => verifyPendingAccount(pending.id)}
            disabled={pendingState.verifying}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {pendingState.verifying ? 'Verificando...' : 'Verificar'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => cancelPendingAccount(pending.id)}
            disabled={actionLoading === pending.id}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {actionLoading === pending.id ? 'Cancelando...' : 'Cancelar'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full min-h-full flex flex-col items-center py-8 px-4 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      {isLoading && (
        <div className="flex items-center justify-center h-64 w-full">
          <Spinner size="lg" className="text-blue-500"/>
          <span className="ml-3 text-white">Cargando cuentas...</span>
        </div>
      )}

      {!isLoading && (
        <div className="w-full max-w-2xl flex flex-col gap-8">
          {/* Encabezado */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-white">Cuentas vinculadas</h1>
            <p className="text-gray-300">
              Vincula tus cuentas de League of Legends para acceder a estadísticas y funcionalidades
              adicionales.
            </p>
          </div>

          {/* Cuentas vinculadas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Tus cuentas vinculadas
              </h2>
              <Link
                href="/linking"
                className="text-blue-400 text-sm hover:underline font-medium"
              >
                Vincular nueva
              </Link>
            </div>

            {accounts.length === 0 ? (
              <div className="p-6 bg-[#1e293b]/50 rounded-md text-center">
                <div className="text-blue-100 mb-4">
                  No tienes cuentas vinculadas
                </div>
                <Link href="/linking">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Vincular cuenta
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Ordenar las cuentas para que la principal aparezca primero */}
                {[...accounts]
                  .sort((a, b) => {
                    // Si a es la cuenta principal, debe ir primero
                    if (a.id === mainAccountId) return -1;
                    // Si b es la cuenta principal, debe ir primero
                    if (b.id === mainAccountId) return 1;
                    // Si ninguna es principal o ambas lo son, mantener el orden original
                    return 0;
                  })
                  .map(renderAccount)}
              </div>
            )}
          </div>

          {/* Cuentas pendientes */}
          {pendingAccounts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Cuentas pendientes
              </h2>
              <div className="flex flex-col gap-4">
                {pendingAccounts.map(renderPendingAccount)}
              </div>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-md text-red-300">
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAll}
                className="ml-4 border-red-500/50 text-red-300 hover:bg-red-900/30"
              >
                Reintentar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
