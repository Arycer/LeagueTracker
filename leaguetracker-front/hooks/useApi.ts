"use client";
import {useCallback, useState} from 'react';
import {useAuth} from '@clerk/nextjs';
import {useToast} from './useToast';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiResponse<T = any> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  headers?: Headers;
};

export type ApiOptions = {
  headers?: Record<string, string>;
  skipAuth?: boolean;
  cache?: RequestCache;
  signal?: AbortSignal;
  supressErrorToast?: boolean;
};

export const BASE_URL = 'http://localhost:8080';

/**
 * Hook personalizado para realizar llamadas a la API con autenticación de Clerk
 */
export function useApi() {
  const {getToken} = useAuth();
  const {error: showErrorToast} = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Realiza una llamada a la API con autenticación automática
   * @param endpoint - Ruta de la API (con o sin / inicial)
   * @param method - Método HTTP (GET, POST, PUT, DELETE, PATCH)
   * @param body - Cuerpo de la solicitud (para POST, PUT, PATCH)
   * @param options - Opciones adicionales para la solicitud
   */
  const callApi = useCallback(async <T = any>(
    endpoint: string,
    method: ApiMethod = 'GET',
    body?: Record<string, unknown>,
    options: ApiOptions = {
      skipAuth: false,
    }
  ): Promise<ApiResponse<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      // Construir la URL completa
      const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      console.log("Realizando solicitud a: " + url + " con opciones: " + JSON.stringify(options));

      // Configurar los headers por defecto
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Añadir token de autenticación si el usuario está autenticado y no se ha indicado skipAuth
      if (!options.skipAuth) {
        try {
          const jwt = await getToken({template: 'DefaultJWT'});
          if (jwt) {
            headers['Authorization'] = `Bearer ${jwt}`;
            console.log("Token agregado a los headers");
          }
        } catch (authError) {
          console.log('No se pudo obtener el token de autenticación:', authError);
        }
      }

      // Configurar las opciones de la solicitud
      const fetchOptions: RequestInit = {
        method,
        headers,
        credentials: 'include',
        cache: options.cache || 'default',
        signal: options.signal,
      };

      // Añadir el cuerpo de la solicitud si es necesario
      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      // Realizar la solicitud
      const response = await fetch(url, fetchOptions);

      // Determinar el tipo de respuesta
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Crear la respuesta
      const apiResponse: ApiResponse<T> = {
        ok: response.ok,
        status: response.status,
        data: response.ok ? data : null,
        error: response.ok ? null : (typeof data === 'string' ? data : JSON.stringify(data)),
        headers: response.headers,
      };

      // Si la respuesta no es exitosa, establecer el error y mostrar toast
      if (!response.ok) {
        const errorMessage = typeof data === 'object' && data?.message
          ? data.message
          : `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);

        // Mostrar toast de error con información adicional
        if (!options.supressErrorToast) {
          showErrorToast(
            'Error en la solicitud',
            `${errorMessage}${endpoint ? ` (${endpoint})` : ''}`,
            {duration: 6000}
          );
        }
      }

      return apiResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);

      // Mostrar toast de error
      if (!options.supressErrorToast) {
        showErrorToast(
          'Error de conexión',
          `No se pudo conectar con el servidor: ${errorMessage}`,
          {duration: 6000}
        );
      }

      // Devolver una respuesta de error
      return {
        ok: false,
        status: 0,
        data: null,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  /**
   * Métodos específicos para cada tipo de solicitud HTTP
   */
  const get = useCallback(<T = any>(endpoint: string, options?: ApiOptions) =>
    callApi<T>(endpoint, 'GET', undefined, options), [callApi]);

  const post = useCallback(<T = any>(endpoint: string, body?: Record<string, unknown>, options?: ApiOptions) =>
    callApi<T>(endpoint, 'POST', body, options), [callApi]);

  const put = useCallback(<T = any>(endpoint: string, body?: Record<string, unknown>, options?: ApiOptions) =>
    callApi<T>(endpoint, 'PUT', body, options), [callApi]);

  const patch = useCallback(<T = any>(endpoint: string, body?: Record<string, unknown>, options?: ApiOptions) =>
    callApi<T>(endpoint, 'PATCH', body, options), [callApi]);

  const del = useCallback(<T = any>(endpoint: string, options?: ApiOptions) =>
    callApi<T>(endpoint, 'DELETE', undefined, options), [callApi]);

  return {
    callApi,
    get,
    post,
    put,
    patch,
    delete: del,
    isLoading,
    error,
  };
}

/**
 * Ejemplo de uso:
 *
 * const { get, post, isLoading, error } = useApi();
 *
 * // Para obtener datos
 * const fetchData = async () => {
 *   const response = await get('/summoners/euw/PlayerName');
 *   if (response.ok) {
 *     setSummoner(response.data);
 *   }
 * };
 *
 * // Para enviar datos
 * const createComment = async () => {
 *   const response = await post('/comments', { text: 'Nuevo comentario' });
 *   if (response.ok) {
 *     // Éxito
 *   }
 * };
 */
