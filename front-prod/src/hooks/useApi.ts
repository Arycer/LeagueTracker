import { useCallback } from 'react';

import { useAuth } from '@clerk/nextjs';
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const BASE_URL = 'https://na25.holy.gg:19308';

export function useApi() {
  const { getToken } = useAuth();

  const callApi = useCallback(async (endpoint: string, method: ApiMethod = 'GET', body?: Record<string, unknown>) => {
    try {
      console.log(`🔄 API Request: ${method} ${endpoint}`);
      
      // Obtener token fresco para cada solicitud
      let jwt: string | null = null;
      try {
        jwt = await getToken({ template: 'DefaultJWT' });
        if (jwt) {
          console.log('✅ Token obtenido correctamente');
        }
      } catch {
        // Usuario no autenticado, continuamos sin token
        console.log('Usuario no autenticado, continuando sin token');
      }
      
      const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
      }

      const options: RequestInit = {
        method,
        headers,
        credentials: 'include',
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      console.log(`📤 Enviando solicitud a: ${url}`);
      console.log('📋 Headers:', headers);
      
      const response = await fetch(url, options);
      console.log(`📥 Respuesta recibida: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.log(`❌ Error API: ${response.status}`, data);
        return {
          ok: false,
          status: response.status,
          data: null,
          error: data || response.statusText,
        };
      }

      return {
        ok: true,
        status: response.status,
        data,
        error: null,
      };

    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }
  }, [getToken]);

  return { callApi };
}
