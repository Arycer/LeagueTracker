"use client";
import React, { useEffect, useState } from 'react';
import { TimelineDto } from '@/types/timeline';
import { useApi } from '@/hooks/useApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GoldTimelineChartProps {
  matchId: string;
  region: string;
}

interface ChartDataPoint {
  time: string;
  timeRaw: number;
  blueTeamGold: number;
  redTeamGold: number;
  goldDiff: number;
}

const GoldTimelineChart: React.FC<GoldTimelineChartProps> = ({ matchId, region }) => {
  const { callApi } = useApi();
  const [timeline, setTimeline] = useState<TimelineDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [finalBlueGold, setFinalBlueGold] = useState(0);
  const [finalRedGold, setFinalRedGold] = useState(0);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!matchId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await callApi(`/api/lol/match/${matchId}/timeline?region=${encodeURIComponent(region)}`);
        
        if (!response.ok) {
          throw new Error("Error al cargar la línea de tiempo");
        }
        
        setTimeline(response.data);
        processTimelineData(response.data);
      } catch (err) {
        console.error("Error cargando la línea de tiempo:", err);
        setError("No se pudo cargar la línea de tiempo");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeline();
  }, [matchId, region, callApi]);

  const processTimelineData = (timelineData: TimelineDto) => {
    if (!timelineData || !timelineData.info || !timelineData.info.frames) {
      return;
    }

    const processedData: ChartDataPoint[] = [];

    // Get participant IDs for each team
    const blueTeamIds: number[] = [];
    const redTeamIds: number[] = [];

    // Map participant IDs to teams (1-5 blue, 6-10 red)
    for (let i = 1; i <= 5; i++) {
      blueTeamIds.push(i);
    }
    for (let i = 6; i <= 10; i++) {
      redTeamIds.push(i);
    }

    // Process each frame to get the gold data
    timelineData.info.frames.forEach((frame) => {
      // Convert timestamp to minutes:seconds format
      const minutes = Math.floor(frame.timestamp / 60000);
      const seconds = Math.floor((frame.timestamp % 60000) / 1000);
      const timeLabel = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      // Calculate total gold for each team
      let blueTeamGold = 0;
      let redTeamGold = 0;

      // Sum up gold for each participant
      Object.values(frame.participantFrames).forEach(participant => {
        if (blueTeamIds.includes(participant.participantId)) {
          blueTeamGold += participant.totalGold;
        } else if (redTeamIds.includes(participant.participantId)) {
          redTeamGold += participant.totalGold;
        }
      });

      // Calculate gold difference (positive means blue team advantage)
      const goldDiff = blueTeamGold - redTeamGold;

      // Add data point to chart data
      processedData.push({
        time: timeLabel,
        timeRaw: frame.timestamp,
        blueTeamGold,
        redTeamGold,
        goldDiff
      });
    });

    // Set final gold values for display
    if (processedData.length > 0) {
      const lastPoint = processedData[processedData.length - 1];
      setFinalBlueGold(lastPoint.blueTeamGold);
      setFinalRedGold(lastPoint.redTeamGold);
    }

    setChartData(processedData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-300">Cargando datos de oro...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 rounded-lg p-4 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!timeline || chartData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">No hay datos de línea de tiempo disponibles</p>
      </div>
    );
  }

  // Función para formatear el tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
    }>;
    label?: string;
  }
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const blueGold = payload[0].value;
      const redGold = payload[1].value;
      const diff = blueGold - redGold;
      const isBlueAhead = diff > 0;
      
      return (
        <div className="bg-[#0f172a] p-3 border border-gray-700 rounded shadow-lg">
          <p className="text-gray-300 text-sm mb-1">{`Tiempo: ${label}`}</p>
          <p className="text-blue-400 text-sm">{`Equipo Azul: ${blueGold.toLocaleString()}`}</p>
          <p className="text-red-400 text-sm">{`Equipo Rojo: ${redGold.toLocaleString()}`}</p>
          <p className={`text-sm ${isBlueAhead ? 'text-blue-400' : 'text-red-400'}`}>
            {`Diferencia: ${Math.abs(diff).toLocaleString()} ${isBlueAhead ? '(Azul)' : '(Rojo)'}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Configurar dominio del eje Y para que empiece desde 0
  const maxGold = Math.max(
    ...chartData.map(data => Math.max(data.blueTeamGold, data.redTeamGold))
  );
  
  // Calcular intervalos para el eje Y
  const yAxisDomain = [0, Math.ceil(maxGold / 10000) * 10000];

  return (
    <div className="bg-[#1e293b]/80 rounded-lg p-6 border border-blue-900/30">
      <h2 className="text-xl font-semibold mb-4">Oro por equipo</h2>
      
      <div className="w-full h-80 bg-[#0f172a]/80 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#94a3b8' }} 
              tickMargin={10}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={yAxisDomain}
              tick={{ fill: '#94a3b8' }} 
              tickFormatter={(value) => (value / 1000) + 'k'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              formatter={(value) => {
                return <span style={{ color: value === 'blueTeamGold' ? '#3b82f6' : '#ef4444' }}>
                  {value === 'blueTeamGold' ? 'Equipo Azul' : 'Equipo Rojo'}
                </span>;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="blueTeamGold" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
              name="blueTeamGold"
            />
            <Line 
              type="monotone" 
              dataKey="redTeamGold" 
              stroke="#ef4444" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#ef4444' }}
              activeDot={{ r: 5 }}
              name="redTeamGold"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-black/20 p-3 rounded">
          <div className="text-xs text-gray-400">Oro final Equipo Azul</div>
          <div className="text-xl font-bold text-blue-400">
            {finalBlueGold.toLocaleString()}
          </div>
        </div>
        <div className="bg-black/20 p-3 rounded">
          <div className="text-xs text-gray-400">Oro final Equipo Rojo</div>
          <div className="text-xl font-bold text-red-400">
            {finalRedGold.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTimelineChart;
