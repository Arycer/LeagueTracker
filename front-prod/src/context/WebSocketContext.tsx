"use client";
import React, { createContext, useContext, useRef, useEffect, useState, ReactNode } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { useUserContext } from './UserContext';
import SockJS from 'sockjs-client';

export type WebSocketContextType = {
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
  const { jwt } = useUserContext();

  useEffect(() => {
    if (!jwt) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
            Authorization: `Bearer ${jwt}`,
        },
        debug: (str) => console.log(str),
        reconnectDelay: 5000,
        onConnect: () => {
            setClient(stompClient);
            console.log('Conectado al WebSocket');
        },
        onDisconnect: () => {
            setClient(null);
        },
        onStompError: (frame) => {
            console.error('Error STOMP:', frame);
        }
    });

    stompClient.activate();
    clientRef.current = stompClient;

    const handleUnload = () => {
      stompClient.deactivate();
      clientRef.current = null;
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      stompClient.deactivate();
      clientRef.current = null;
    };
  }, [jwt]);


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
    <WebSocketContext.Provider value={{ client, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return ctx;
};
