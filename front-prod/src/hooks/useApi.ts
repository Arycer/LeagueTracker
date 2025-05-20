import { useCallback } from 'react';
import { useUserContext } from '../context/UserContext';
import { useAuth } from '@clerk/nextjs';
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const BASE_URL = 'http://localhost:8080';

export function useApi() {
  const { getToken } = useAuth();

  const callApi = useCallback(async (endpoint: string, method: ApiMethod = 'GET', body?: any) => {
    try {
      console.log(`🔄 API Request: ${method} ${endpoint}`);
      
      // Obtener token fresco para cada solicitud
      const jwt = await getToken({ template: 'DefaultJWT' });
      if (!jwt) {
        console.error('❌ No se pudo obtener token para la solicitud API');
      } else {
        console.log('✅ Token obtenido correctamente');
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error API: ${response.status}`, errorText);
        throw new Error(`API error: ${response.status} - ${errorText || response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📊 Datos JSON recibidos:', data);
        return data;
      }
      
      data = await response.text();
      console.log('📝 Texto recibido:', data);
      return data;
    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }
  }, [getToken]);

  return { callApi };
}
