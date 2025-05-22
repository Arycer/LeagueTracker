"use client";
import React, {createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {Client, IMessage, StompSubscription} from '@stomp/stompjs';
import {useAuth} from '@clerk/nextjs';
import SockJS from 'sockjs-client';

// URL del servidor WebSocket - usando la URL local para desarrollo
const WS_URL = 'http://localhost:8080/ws';

export type WebSocketContextType = {
  connected: boolean;
  client: Client | null;
  sendMessage: (destination: string, body: unknown) => void;
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
  unsubscribe: (subscription: StompSubscription) => void;
  reconnect: () => Promise<void>;
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
  const subscriptionsRef = useRef<StompSubscription[]>([]);

  const createClient = useCallback(async () => {
    try {
      console.log('🔌 Iniciando conexión WebSocket...');
      // Desconectar cliente existente si hay uno
      if (clientRef.current) {
        console.log('🔌 Desconectando cliente WebSocket existente');
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      
      // Obtener token fresco
      let token: string | null = null;
      try {
        token = await getToken({ template: 'DefaultJWT' });
        if (!token) {
          console.log('🔑 No hay token disponible para WebSocket, posiblemente no autenticado');
          return;
        }
      } catch (error) {
        console.log('👤 Usuario no autenticado, no se puede establecer conexión WebSocket');
        return;
      }
      
      console.log('🔑 Token obtenido, creando conexión WebSocket');
      const socket = new SockJS(WS_URL);
      const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔌 STOMP: ${str}`);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('✅ Conectado al WebSocket exitosamente');
          setClient(stompClient);
          setConnected(true);
        },
        onDisconnect: () => {
          console.log('❌ Desconectado del WebSocket');
          setClient(null);
          setConnected(false);
        },
        onStompError: (frame) => {
          console.error('❌ Error STOMP:', frame);
        },
        onWebSocketClose: (event) => {
          console.log(`🔌 Conexión WebSocket cerrada: ${event.code} - ${event.reason}`);
        },
        onWebSocketError: (event) => {
          console.error('❌ Error en WebSocket:', event);
        }
      });

      console.log('🔌 Activando cliente WebSocket');
      stompClient.activate();
      clientRef.current = stompClient;

      const handleUnload = () => {
        console.log('🔌 Cerrando conexión WebSocket (beforeunload)');
        stompClient.deactivate();
        clientRef.current = null;
        setConnected(false);
      };
      
      window.addEventListener('beforeunload', handleUnload);

      return () => {
        console.log('🧹 Limpiando conexión WebSocket');
        window.removeEventListener('beforeunload', handleUnload);
        stompClient.deactivate();
        clientRef.current = null;
        setConnected(false);
      };
    } catch (err) {
      console.error('❌ Error al crear cliente WebSocket:', err);
    }
  }, [getToken]);

  useEffect(() => {
    // Iniciar la conexión WebSocket
    createClient();
    
    // Función de limpieza
    return () => {
      // La limpieza se maneja dentro de createClient cuando se desactiva
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
    };
  }, [createClient]);

  const reconnect = async () => {
    console.log('🔄 Intentando reconectar WebSocket...');
    await createClient();
  };

  const sendMessage = (destination: string, body: unknown) => {
    if (clientRef.current && clientRef.current.connected) {
      console.log(`📤 Enviando mensaje a ${destination}:`, body);
      clientRef.current.publish({
        destination,
        body: typeof body === 'string' ? body : JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
      });
    } else {
      console.warn('⚠️ Intento de enviar mensaje sin conexión WebSocket activa');
    }
  };

  const subscribe = (destination: string, callback: (message: IMessage) => void): StompSubscription | null => {
    if (clientRef.current && clientRef.current.connected) {
      console.log(`📥 Suscribiendo a ${destination}`);
      const subscription = clientRef.current.subscribe(destination, (message) => {
        console.log(`📩 Mensaje recibido de ${destination}:`, message);
        callback(message);
      });
      subscriptionsRef.current.push(subscription);
      return subscription;
    }
    console.warn(`⚠️ Intento de suscripción a ${destination} sin conexión WebSocket activa`);
    return null;
  };

  const unsubscribe = (subscription: StompSubscription) => {
    if (subscription) {
      console.log(`🔕 Cancelando suscripción a ${subscription.id}`);
      subscription.unsubscribe();
      subscriptionsRef.current = subscriptionsRef.current.filter(sub => sub.id !== subscription.id);
    }
  };

  return (
    <WebSocketContext.Provider value={{ connected, client, sendMessage, subscribe, unsubscribe, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket debe ser usado dentro de un WebSocketProvider');
  return ctx;
};
