"use client";

import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {useApi} from '@/hooks/useApi';
import {useToast} from '@/hooks/useToast';
import {useDDragon} from './DDragonContext';
import {Region} from '@/constants/regions';

// Definición de tipos
export interface LolAccount {
  id: string;
  summonerName: string;
  tagline: string;
  summonerId: string;
  profileIconId: number;
  region: string;
  verified: boolean;
}

export interface PendingLolAccount {
  id: string;
  summonerName: string;
  tagline: string;
  region: string;
  requestedAt: string;
  profileIconId: number;
}

export type PendingActionState = {
  [id: string]: {
    verifying: boolean;
    verificationResult: "idle" | "success" | "error";
    errorMsg?: string;
  };
};

// Definir el tipo del contexto
// Interfaz para la solicitud de vinculación
export interface LinkRequest {
  summonerName: string;
  tagline: string;
  region: Region;
}

// Interfaz para la respuesta de la solicitud de vinculación
export interface LinkResponse {
  requiredIcon: number;
}

interface LinkedAccountsContextType {
  // Estado
  accounts: LolAccount[];
  pendingAccounts: PendingLolAccount[];
  mainAccountId: string | null;
  isLoading: boolean;
  error: string | null;
  actionLoading: string | null;
  pendingActionState: PendingActionState;

  // Acciones
  fetchAccounts: () => Promise<void>;
  fetchPendingAccounts: () => Promise<void>;
  fetchMainAccount: () => Promise<void>;
  setMainAccount: (id: string) => Promise<boolean>;
  unlinkAccount: (id: string) => Promise<boolean>;
  cancelPendingAccount: (id: string) => Promise<boolean>;
  verifyPendingAccount: (id: string) => Promise<boolean>;
  refreshAll: () => Promise<void>;

  // Acciones de vinculación
  linkAccount: (request: LinkRequest) => Promise<LinkResponse | null>;
  verifyAccount: () => Promise<boolean>;
}

// Crear el contexto
const LinkedAccountsContext = createContext<LinkedAccountsContextType | undefined>(undefined);

// Props del proveedor
interface LinkedAccountsProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de cuentas vinculadas
 * Gestiona el estado y las operaciones relacionadas con las cuentas de LoL vinculadas
 */
export const LinkedAccountsProvider: React.FC<LinkedAccountsProviderProps> = ({children}) => {
  // Estado
  const [accounts, setAccounts] = useState<LolAccount[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingLolAccount[]>([]);
  const [mainAccountId, setMainAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingActionState, setPendingActionState] = useState<PendingActionState>({});

  // Hooks
  const {get, post, delete: del} = useApi();
  const {success, error: showError, info} = useToast();
  const {currentVersion} = useDDragon();

  // Obtener cuentas vinculadas
  const fetchAccounts = useCallback(async () => {
    console.log("Obteniendo cuentas vinculadas...");
    try {
      const res = await get('/api/lol/accounts/accounts');

      console.log("Respuesta completa de cuentas vinculadas:", res);

      if (res.ok) {
        // Si la respuesta es exitosa pero no hay datos, asumimos una lista vacía
        if (!res.data) {
          console.log("No hay cuentas vinculadas disponibles");
          setAccounts([]);
        } else {
          setAccounts(Array.isArray(res.data) ? res.data : []);
          console.log("Cuentas vinculadas obtenidas:", res.data);
        }
        // Limpiar cualquier error previo
        setError(null);
      } else {
        console.error("Error al obtener cuentas vinculadas:", res.error, "Respuesta completa:", res);
        setError(res.error || "No se pudieron cargar las cuentas vinculadas");
      }
    } catch (err) {
      console.error("Excepción al obtener cuentas vinculadas:", err);
      setError("Error de conexión al obtener cuentas vinculadas");
    }
  }, [get]);

  // Obtener cuenta principal
  const fetchMainAccount = useCallback(async () => {
    console.log("Obteniendo cuenta principal...");
    try {
      const res = await get('/api/lol/accounts/main');

      console.log("Respuesta completa de cuenta principal:", res);

      if (res.ok) {
        // Si la respuesta es exitosa pero no hay datos, no hay cuenta principal
        if (!res.data) {
          console.log("No hay cuenta principal configurada");
          setMainAccountId(null);
        } else {
          setMainAccountId(res.data.id || null);
          console.log("Cuenta principal obtenida:", res.data);
        }
      } else {
        console.error("Error al obtener cuenta principal:", res.error, "Respuesta completa:", res);
        setMainAccountId(null);
      }
    } catch (err) {
      console.error("Excepción al obtener cuenta principal:", err);
      setMainAccountId(null);
    }
  }, [get]);

  // Establecer cuenta principal
  const setMainAccount = useCallback(async (id: string) => {
    setActionLoading(id);
    console.log(`Estableciendo cuenta ${id} como principal...`);

    const res = await post(`/api/lol/accounts/${id}/set-main`);

    if (res.ok) {
      console.log("Cuenta principal actualizada correctamente");
      await Promise.all([fetchAccounts(), fetchMainAccount()]);
      success("Cuenta principal actualizada", "La cuenta ha sido establecida como principal");
      setActionLoading(null);
      return true;
    } else {
      console.error("Error al establecer cuenta principal:", res.error);
      showError("Error", res.error || "No se pudo establecer la cuenta principal");
      setActionLoading(null);
      return false;
    }
  }, [post, fetchAccounts, fetchMainAccount, success, showError]);

  // Obtener cuentas pendientes
  const fetchPendingAccounts = useCallback(async () => {
    console.log("Obteniendo cuentas pendientes...");
    const res = await get('/api/lol/accounts/pending');

    if (res.ok && res.data) {
      setPendingAccounts(Array.isArray(res.data) ? res.data : []);
      console.log("Cuentas pendientes obtenidas:", res.data);
    } else {
      console.error("Error al obtener cuentas pendientes:", res.error);
    }
  }, [get]);

  // Desvincular cuenta
  const unlinkAccount = useCallback(async (id: string) => {
    setActionLoading(id);
    console.log(`Desvinculando cuenta ${id}...`);

    const res = await del(`/api/lol/accounts/${id}`);

    if (res.ok) {
      console.log("Cuenta desvinculada correctamente");
      await fetchAccounts();
      success("Cuenta desvinculada", "La cuenta ha sido desvinculada correctamente");
      setActionLoading(null);
      return true;
    } else {
      console.error("Error al desvincular cuenta:", res.error);
      showError("Error", res.error || "No se pudo desvincular la cuenta");
      setActionLoading(null);
      return false;
    }
  }, [del, fetchAccounts, success, showError]);

  // Cancelar cuenta pendiente
  const cancelPendingAccount = useCallback(async (id: string) => {
    setActionLoading(id);
    console.log(`Cancelando cuenta pendiente ${id}...`);

    const res = await del(`/api/lol/accounts/pending/${id}`);

    if (res.ok) {
      console.log("Cuenta pendiente cancelada correctamente");
      await fetchPendingAccounts();
      success("Solicitud cancelada", "La solicitud de vinculación ha sido cancelada");
      setActionLoading(null);
      return true;
    } else {
      console.error("Error al cancelar cuenta pendiente:", res.error);
      showError("Error", res.error || "No se pudo cancelar la solicitud");
      setActionLoading(null);
      return false;
    }
  }, [del, fetchPendingAccounts, success, showError]);

  // Verificar cuenta pendiente
  const verifyPendingAccount = useCallback(async (id: string) => {
    setPendingActionState((prev) => ({
      ...prev,
      [id]: {verifying: true, verificationResult: "idle"},
    }));

    console.log(`Verificando cuenta pendiente ${id}...`);
    const res = await post('/api/lol/accounts/verify', {pendingAccountId: id});

    if (res.ok && res.data && res.data.verified) {
      console.log("Cuenta verificada correctamente");
      setPendingActionState((prev) => ({
        ...prev,
        [id]: {verifying: false, verificationResult: "success"},
      }));

      await Promise.all([fetchPendingAccounts(), fetchAccounts()]);
      success("Cuenta verificada", "La cuenta ha sido verificada y vinculada correctamente");
      return true;
    } else {
      console.error("Error al verificar cuenta:", res.error);
      setPendingActionState((prev) => ({
        ...prev,
        [id]: {
          verifying: false,
          verificationResult: "error",
          errorMsg: res.error || "No se pudo verificar la cuenta. Asegúrate de tener el icono correcto.",
        },
      }));

      showError(
        "Error de verificación",
        res.error || "No se pudo verificar la cuenta. Asegúrate de tener el icono correcto."
      );
      return false;
    }
  }, [post, fetchPendingAccounts, fetchAccounts, success, showError]);

  // Actualizar todos los datos
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchAccounts(),
        fetchPendingAccounts(),
        fetchMainAccount(),
      ]);
      console.log("Todos los datos actualizados correctamente");
    } catch (err) {
      console.error("Error al actualizar los datos:", err);
      setError("No se pudieron cargar los datos. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAccounts, fetchPendingAccounts, fetchMainAccount]);

  // Iniciar proceso de vinculación
  const linkAccount = useCallback(async (request: LinkRequest): Promise<LinkResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convertir a Record<string, unknown> para satisfacer el tipo esperado por post
      const requestData: Record<string, unknown> = {
        summonerName: request.summonerName,
        tagline: request.tagline,
        region: request.region
      };

      const res = await post('/api/lol/accounts/link', requestData);

      if (res.ok && res.data) {
        const response: LinkResponse = {
          requiredIcon: res.data.requiredIcon
        };
        info('Cuenta encontrada', 'Sigue las instrucciones para verificar que eres el propietario');
        return response;
      } else {
        // Extraer el mensaje de error de la respuesta
        let errorMessage = 'Error desconocido al vincular la cuenta';

        if (res.error) {
          try {
            // Intentar parsear el error si es un string JSON
            if (typeof res.error === 'string' && res.error.startsWith('{')) {
              const parsedError = JSON.parse(res.error);
              if (parsedError.error) {
                errorMessage = parsedError.error;
              }
            } else {
              errorMessage = res.error;
            }
          } catch {
            // Si no se puede parsear, usar el error tal cual
            errorMessage = res.error;
          }
        }

        // Mostrar el error como toast en lugar de en la consola
        showError('Error de vinculación', errorMessage);

        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = 'Error de conexión al intentar vincular la cuenta';
      showError('Error de conexión', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [post, info, showError]);

  // Verificar cuenta (sin ID específico)
  const verifyAccount = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Verificando cuenta...");

      const res = await post('/api/lol/accounts/verify');

      console.log("Respuesta de verificación:", res);

      if (res.ok && res.data && res.data.verified) {
        console.log("Cuenta verificada correctamente");
        await Promise.all([fetchPendingAccounts(), fetchAccounts()]);
        success("Cuenta verificada", "La cuenta ha sido verificada y vinculada correctamente");
        return true;
      } else {
        console.error("Error al verificar cuenta:", res.error);
        showError(
          "Error de verificación",
          res.error || "No se pudo verificar la cuenta. Asegúrate de tener el icono correcto."
        );
        return false;
      }
    } catch (err) {
      console.error("Excepción al verificar cuenta:", err);
      showError("Error", "Error de conexión al verificar la cuenta");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [post, fetchPendingAccounts, fetchAccounts, success, showError]);

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <LinkedAccountsContext.Provider
      value={{
        accounts,
        pendingAccounts,
        mainAccountId,
        isLoading,
        error,
        actionLoading,
        pendingActionState,
        fetchAccounts,
        fetchPendingAccounts,
        fetchMainAccount,
        setMainAccount,
        unlinkAccount,
        cancelPendingAccount,
        verifyPendingAccount,
        refreshAll,
        linkAccount,
        verifyAccount,
      }}
    >
      {children}
    </LinkedAccountsContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto de cuentas vinculadas
 * @returns Información y acciones relacionadas con las cuentas vinculadas
 */
export const useLinkedAccounts = () => {
  const context = useContext(LinkedAccountsContext);
  if (context === undefined) {
    throw new Error('useLinkedAccounts debe ser usado dentro de un LinkedAccountsProvider');
  }
  return context;
};
