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

export const BASE_URL = 'https://loltracker.arycer.me';

export function useApi() {
  const {getToken} = useAuth();
  const {error: showErrorToast} = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      console.log("Realizando solicitud a: " + url + " con opciones: " + JSON.stringify(options));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

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

      const fetchOptions: RequestInit = {
        method,
        headers,
        credentials: 'include',
        cache: options.cache || 'default',
        signal: options.signal,
      };

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const apiResponse: ApiResponse<T> = {
        ok: response.ok,
        status: response.status,
        data: response.ok ? data : null,
        error: response.ok ? null : (typeof data === 'string' ? data : JSON.stringify(data)),
        headers: response.headers,
      };

      if (!response.ok) {
        const errorMessage = typeof data === 'object' && data?.message
          ? data.message
          : `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);

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

      if (!options.supressErrorToast) {
        showErrorToast(
          'Error de conexión',
          `No se pudo conectar con el servidor: ${errorMessage}`,
          {duration: 6000}
        );
      }

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

