"use client";
import React, { createContext, useContext, useRef, useEffect, useState, ReactNode, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { useUserContext } from './UserContext';
import { useAuth } from '@clerk/nextjs';
import SockJS from 'sockjs-client';

export type WebSocketContextType = {
  connected: boolean;
  client: Client | null;
  sendMessage: (destination: string, body: any) => void;
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const { getToken } = useAuth();

  const createClient = useCallback(async () => {
    try {
      console.log('Iniciando conexión WebSocket...');
      // Desconectar cliente existente si hay uno
      if (clientRef.current) {
        console.log('Desconectando cliente WebSocket existente');
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      
      // Obtener token fresco
      const token = await getToken({ template: 'DefaultJWT' });
      if (!token) {
        console.error('No se pudo obtener token para WebSocket');
        return;
      }
      
      console.log('Token obtenido, creando conexión WebSocket');
      const socket = new SockJS("http://localhost:8080/ws");
      const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => console.log(str),
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('Conectado al WebSocket exitosamente');
          setClient(stompClient);
          setConnected(true);
        },
        onDisconnect: () => {
          console.log('Desconectado del WebSocket');
          setClient(null);
          setConnected(false);
        },
        onStompError: (frame) => {
          console.error('Error STOMP:', frame);
        }
      });

      console.log('Activando cliente WebSocket');
      stompClient.activate();
      clientRef.current = stompClient;

      const handleUnload = () => {
        console.log('Cerrando conexión WebSocket (beforeunload)');
        stompClient.deactivate();
        clientRef.current = null;
        setConnected(false);
      };
      
      window.addEventListener('beforeunload', handleUnload);

      return () => {
        console.log('Limpiando conexión WebSocket');
        window.removeEventListener('beforeunload', handleUnload);
        stompClient.deactivate();
        clientRef.current = null;
        setConnected(false);
      };
    } catch (error) {
      console.error('Error al crear cliente WebSocket:', error);
    }
  }, [getToken]);

  useEffect(() => {
    createClient();
  }, []);


  const sendMessage = (destination: string, body: any) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: typeof body === 'string' ? body : JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
      });
    }
  };

  const subscribe = (destination: string, callback: (message: IMessage) => void): StompSubscription | null => {
    if (clientRef.current && clientRef.current.connected) {
      return clientRef.current.subscribe(destination, callback);
    }
    return null;
  };

  return (
    <WebSocketContext.Provider value={{ connected, client, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return ctx;
};
