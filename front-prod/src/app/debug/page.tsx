"use client";
import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { useWebSocket } from '@/context/WebSocketContext';
import { useUserContext } from '@/context/UserContext';
import { useAuth } from '@clerk/nextjs';

export default function DebugPage() {
  const { callApi } = useApi();
  const { connected, sendMessage, subscribe } = useWebSocket();
  const { username } = useUserContext();
  const { getToken } = useAuth();
  
  const [apiResult, setApiResult] = useState<string>('No data yet');
  const [apiError, setApiError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [testEndpoint, setTestEndpoint] = useState<string>('/api/friends');

  // Probar obtener token
  const fetchToken = async () => {
    try {
      const token = await getToken({ template: 'DefaultJWT' });
      setToken(token || 'No token received');
    } catch (error) {
      console.error('Error getting token:', error);
      setToken('Error getting token');
    }
  };

  // Probar llamada a API
  const testApiCall = async () => {
    setApiError(null);
    const res = await callApi(testEndpoint);
    setApiResult(JSON.stringify(res, null, 2));
    
    if (!res.ok) {
      console.error('API test error:', res.error);
      setApiError(typeof res.error === 'string' ? res.error : 'Unknown error');
    }
  };

  // Probar WebSocket
  const testWebSocket = () => {
    if (!connected) {
      setWsMessages(prev => [...prev, 'WebSocket not connected']);
      return;
    }
    
    // Suscribirse a mensajes de presencia
    const subscription = subscribe('/user/queue/presence', (message) => {
      setWsMessages(prev => [...prev, `Received: ${message.body}`]);
    });
    
    if (subscription) {
      setWsMessages(prev => [...prev, 'Subscribed to /user/queue/presence']);
    } else {
      setWsMessages(prev => [...prev, 'Failed to subscribe']);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API & WebSocket Debug</h1>
      
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Authentication</h2>
        <p className="mb-2">Username: {username || 'Not logged in'}</p>
        <div className="mb-2">
          <button 
            onClick={fetchToken}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Get Token
          </button>
        </div>
        <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-20">
          <pre className="text-xs">{token ? `${token.substring(0, 20)}...` : 'No token'}</pre>
        </div>
      </div>
      
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">API Test</h2>
        <div className="flex mb-2">
          <input
            type="text"
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="border p-2 flex-grow"
            placeholder="API endpoint"
          />
          <button 
            onClick={testApiCall}
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
          >
            Test API
          </button>
        </div>
        {apiError && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">
            {apiError}
          </div>
        )}
        <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-60">
          <pre className="text-xs">{apiResult}</pre>
        </div>
      </div>
      
      <div className="p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">WebSocket Test</h2>
        <div className="mb-2">
          <p>Status: {connected ? '✅ Connected' : '❌ Disconnected'}</p>
          <button 
            onClick={testWebSocket}
            className="bg-purple-500 text-white px-4 py-2 rounded mt-2"
            disabled={!connected}
          >
            Subscribe to Presence
          </button>
        </div>
        <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-60">
          {wsMessages.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            <ul className="list-disc pl-5">
              {wsMessages.map((msg, i) => (
                <li key={i} className="text-sm">{msg}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
