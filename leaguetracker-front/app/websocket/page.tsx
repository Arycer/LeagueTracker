"use client";
import React from 'react';
import WebSocketDemo from '@/components/websocket/WebSocketDemo';

/**
 * Página de demostración para WebSocket
 */
export default function WebSocketPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">WebSocket Demo</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">Información</h2>
          <p className="mb-2">
            Esta página demuestra la funcionalidad de WebSocket en LeagueTracker.
          </p>
          <p className="mb-2">
            Puedes usar esta página para probar la conexión WebSocket, suscribirte a temas y enviar/recibir mensajes.
          </p>
        </div>
        
        <WebSocketDemo />
      </div>
    </div>
  );
}
