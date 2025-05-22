"use client";
import React, {useEffect, useRef, useState} from 'react';
import {useWebSocket} from '@/contexts/WebSocketContext';
import {useAuth} from '@clerk/nextjs';

/**
 * Componente de demostración para WebSocket
 * Muestra el estado de la conexión y permite enviar/recibir mensajes
 */
const WebSocketDemo = () => {
  const { connected, sendMessage, subscribe, unsubscribe, reconnect } = useWebSocket();
  const { isSignedIn } = useAuth();
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [destination, setDestination] = useState('/topic/test');
  const [subscribed, setSubscribed] = useState(false);
  const subscriptionRef = useRef<any>(null);
  
  // Manejar la suscripción/cancelación de suscripción
  const handleSubscription = () => {
    if (!connected) {
      addMessage('⚠️ No hay conexión WebSocket activa');
      return;
    }
    
    if (subscribed) {
      if (subscriptionRef.current) {
        unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
        setSubscribed(false);
        addMessage(`🔕 Cancelada suscripción a ${destination}`);
      }
    } else {
      const subscription = subscribe(destination, (message) => {
        try {
          const body = JSON.parse(message.body);
          addMessage(`📩 Mensaje recibido: ${JSON.stringify(body)}`);
        } catch (e) {
          addMessage(`📩 Mensaje recibido: ${message.body}`);
        }
      });
      
      if (subscription) {
        subscriptionRef.current = subscription;
        setSubscribed(true);
        addMessage(`🔔 Suscrito a ${destination}`);
      } else {
        addMessage('⚠️ Error al suscribirse');
      }
    }
  };
  
  // Enviar un mensaje
  const handleSendMessage = () => {
    if (!connected) {
      addMessage('⚠️ No hay conexión WebSocket activa');
      return;
    }
    
    if (!inputMessage.trim()) {
      addMessage('⚠️ El mensaje no puede estar vacío');
      return;
    }
    
    try {
      // Intentar parsear como JSON
      const jsonMessage = JSON.parse(inputMessage);
      sendMessage(destination, jsonMessage);
      addMessage(`📤 Mensaje enviado a ${destination}: ${inputMessage}`);
    } catch (e) {
      // Si no es JSON válido, enviar como texto
      sendMessage(destination, inputMessage);
      addMessage(`📤 Mensaje enviado a ${destination}: ${inputMessage}`);
    }
    
    setInputMessage('');
  };
  
  // Intentar reconectar
  const handleReconnect = async () => {
    addMessage('🔄 Intentando reconectar...');
    await reconnect();
  };
  
  // Añadir un mensaje a la lista
  const addMessage = (message: string) => {
    setMessages((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };
  
  // Limpiar los mensajes
  const clearMessages = () => {
    setMessages([]);
  };
  
  // Efecto para añadir un mensaje cuando cambia el estado de la conexión
  useEffect(() => {
    if (connected) {
      addMessage('✅ Conectado al WebSocket');
    } else {
      addMessage('❌ Desconectado del WebSocket');
      // Si estábamos suscritos, actualizar el estado
      if (subscribed) {
        subscriptionRef.current = null;
        setSubscribed(false);
      }
    }
  }, [connected]);
  
  return (
    <div className="p-4 bg-card rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Demo de WebSocket</h2>
      
      {!isSignedIn && (
        <div className="mb-4 p-3 bg-yellow-800/20 text-yellow-300 rounded-md">
          ⚠️ Debes iniciar sesión para usar WebSocket
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{connected ? 'Conectado' : 'Desconectado'}</span>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Destino</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm"
              placeholder="/topic/ejemplo"
            />
            <button
              onClick={handleSubscription}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                subscribed
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={!connected}
            >
              {subscribed ? 'Cancelar' : 'Suscribir'}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Mensaje</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm"
              placeholder="Mensaje o JSON"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              disabled={!connected || !inputMessage.trim()}
            >
              Enviar
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Puedes enviar texto plano o un objeto JSON válido
          </p>
        </div>
      </div>
      
      <div className="mb-4 flex justify-between">
        <button
          onClick={handleReconnect}
          className="bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-md text-sm font-medium"
        >
          Reconectar
        </button>
        
        <button
          onClick={clearMessages}
          className="bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-md text-sm font-medium"
        >
          Limpiar mensajes
        </button>
      </div>
      
      <div className="border border-border rounded-md overflow-hidden">
        <div className="bg-secondary/50 px-3 py-2 text-sm font-medium border-b border-border">
          Mensajes
        </div>
        <div className="h-64 overflow-y-auto p-3 bg-background">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay mensajes</p>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, index) => (
                <div key={index} className="text-sm font-mono">
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSocketDemo;
