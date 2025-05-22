'use client';

import React, {useRef, useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ApiMethod, useApi} from '@/hooks/useApi';
import {DDragonVersionDisplay} from '@/components/ddragon';
import {SignedOut} from '@clerk/nextjs';

// Endpoints predefinidos para facilitar las pruebas
const PREDEFINED_ENDPOINTS = [
  { name: 'Versión DDragon', endpoint: 'https://ddragon.leagueoflegends.com/api/versions.json', method: 'GET' },
  { name: 'Buscar invocador (EUW)', endpoint: '/summoners/euw/', method: 'GET', placeholder: 'Nombre de invocador' },
  { name: 'Historial de partidas', endpoint: '/matches/euw/', method: 'GET', placeholder: 'ID de invocador' },
  { name: 'Detalles de partida', endpoint: '/matches/euw/match/', method: 'GET', placeholder: 'ID de partida' },
  { name: 'Amigos', endpoint: '/friends', method: 'GET' },
  { name: 'Cuentas vinculadas', endpoint: '/linked-accounts', method: 'GET' },
];

// Componente para mostrar la respuesta JSON formateada
const JsonViewer = ({ data }: { data: any }) => {
  if (!data) return null;
  
  return (
    <pre className="bg-[#0f172a] p-4 rounded-md overflow-auto max-h-[500px] text-sm">
      <code className="text-gray-300">
        {JSON.stringify(data, null, 2)}
      </code>
    </pre>
  );
};

export default function DebugPage() {
  const { callApi } = useApi();
  const [endpoint, setEndpoint] = useState<string>('');
  const [method, setMethod] = useState<ApiMethod>('GET');
  const [requestBody, setRequestBody] = useState<string>('');
  const [paramValue, setParamValue] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requestHistory, setRequestHistory] = useState<Array<{endpoint: string, method: ApiMethod, body?: string}>>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<number | null>(null);
  
  const responseRef = useRef<HTMLDivElement>(null);
  
  // Función para ejecutar la solicitud a la API
  const executeRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      // Construir la URL completa si se seleccionó un endpoint predefinido con placeholder
      let finalEndpoint = endpoint;
      if (selectedEndpoint !== null && PREDEFINED_ENDPOINTS[selectedEndpoint].placeholder && paramValue) {
        finalEndpoint = `${endpoint}${paramValue}`;
      }
      
      // Preparar el cuerpo de la solicitud si es necesario
      let body: Record<string, unknown> | undefined;
      if (requestBody && method !== 'GET') {
        try {
          body = JSON.parse(requestBody);
        } catch (e) {
          setError('Error al parsear el cuerpo de la solicitud. Asegúrate de que sea un JSON válido.');
          setLoading(false);
          return;
        }
      }
      
      // Ejecutar la solicitud
      const result = await callApi(finalEndpoint, method, body);
      
      // Guardar en el historial
      setRequestHistory(prev => [
        { endpoint: finalEndpoint, method, body: requestBody },
        ...prev.slice(0, 9) // Mantener solo los últimos 10
      ]);
      
      // Mostrar la respuesta
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      
      // Desplazarse a la respuesta
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  // Seleccionar un endpoint predefinido
  const selectPredefinedEndpoint = (index: number) => {
    const selected = PREDEFINED_ENDPOINTS[index];
    setEndpoint(selected.endpoint);
    setMethod(selected.method as ApiMethod);
    setRequestBody('');
    setParamValue('');
    setSelectedEndpoint(index);
  };
  
  // Seleccionar un endpoint del historial
  const selectFromHistory = (item: {endpoint: string, method: ApiMethod, body?: string}, index: number) => {
    setEndpoint(item.endpoint);
    setMethod(item.method);
    setRequestBody(item.body || '');
    setSelectedEndpoint(null);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="bg-[#1e293b]/70 border-blue-900/30 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Consola de depuración API</h1>
            <DDragonVersionDisplay />
          </div>
          
          <SignedOut>
            <div className="bg-red-500/20 border border-red-500/30 rounded-md p-4 mb-6">
              <p className="text-red-200">
                ⚠️ No has iniciado sesión. Algunas solicitudes a la API pueden requerir autenticación.
              </p>
            </div>
          </SignedOut>
          
          <div className="space-y-6">
            {/* Endpoints predefinidos */}
            <div>
              <h2 className="text-lg font-medium text-blue-400 mb-3">Endpoints predefinidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {PREDEFINED_ENDPOINTS.map((item, index) => (
                  <Button
                    key={index}
                    variant={selectedEndpoint === index ? "default" : "outline"}
                    className={selectedEndpoint === index 
                      ? "bg-blue-500 hover:bg-blue-600 text-white" 
                      : "border-blue-900/30 hover:bg-blue-500/10 text-gray-300"
                    }
                    onClick={() => selectPredefinedEndpoint(index)}
                  >
                    {item.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Formulario de solicitud */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Método</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as ApiMethod)}
                    className="w-full h-10 px-3 rounded-md bg-[#0f172a] border border-blue-900/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                <div className="w-full md:w-3/4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Endpoint</label>
                  <Input
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://loltracker.arycer.me/api/..."
                    className="h-10 bg-[#0f172a] border-blue-900/30 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
              
              {/* Parámetro adicional si el endpoint seleccionado tiene placeholder */}
              {selectedEndpoint !== null && PREDEFINED_ENDPOINTS[selectedEndpoint].placeholder && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {PREDEFINED_ENDPOINTS[selectedEndpoint].placeholder}
                  </label>
                  <Input
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    placeholder={PREDEFINED_ENDPOINTS[selectedEndpoint].placeholder}
                    className="h-10 bg-[#0f172a] border-blue-900/30 focus:ring-blue-500 text-white"
                  />
                </div>
              )}
              
              {/* Cuerpo de la solicitud para métodos que no son GET */}
              {method !== 'GET' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cuerpo de la solicitud (JSON)</label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={5}
                    className="w-full px-3 py-2 rounded-md bg-[#0f172a] border border-blue-900/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <Button
                onClick={executeRequest}
                disabled={loading || !endpoint}
                className="bg-blue-500 hover:bg-blue-600 text-white w-full"
              >
                {loading ? 'Ejecutando...' : 'Ejecutar solicitud'}
              </Button>
            </div>
            
            {/* Historial de solicitudes */}
            {requestHistory.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-blue-400 mb-3">Historial de solicitudes</h2>
                <div className="space-y-2">
                  {requestHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-[#0f172a]/50 hover:bg-[#0f172a] cursor-pointer"
                      onClick={() => selectFromHistory(item, index)}
                    >
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium mr-2 
                          ${item.method === 'GET' ? 'bg-blue-500/20 text-blue-300' : 
                            item.method === 'POST' ? 'bg-green-500/20 text-green-300' :
                            item.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' :
                            item.method === 'DELETE' ? 'bg-red-500/20 text-red-300' : 
                            'bg-purple-500/20 text-purple-300'}`}
                        >
                          {item.method}
                        </span>
                        <span className="text-gray-300 truncate max-w-[300px]">{item.endpoint}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRequestHistory(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Sección de respuesta */}
      <div ref={responseRef}>
        {(response || error) && (
          <Card className="bg-[#1e293b]/70 border-blue-900/30">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Respuesta</h2>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-md p-4 mb-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}
              
              {response && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium
                      ${response.status >= 200 && response.status < 300 ? 'bg-green-500/20 text-green-300' : 
                        response.status >= 400 && response.status < 500 ? 'bg-yellow-500/20 text-yellow-300' :
                        response.status >= 500 ? 'bg-red-500/20 text-red-300' : 
                        'bg-blue-500/20 text-blue-300'}`}
                    >
                      {response.status}
                    </div>
                    <span className="text-gray-300">
                      {response.ok ? 'Solicitud exitosa' : 'Error en la solicitud'}
                    </span>
                  </div>
                  
                  <JsonViewer data={response.data || response.error} />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
