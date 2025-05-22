"use client";
import React, {useEffect, useState} from 'react';
import {TimelineDto} from '@/types/timeline';
import {useApi} from '@/hooks/useApi';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

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

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
}


export const GoldTimelineChart: React.FC<GoldTimelineChartProps> = ({matchId, region}) => {
  const {get} = useApi();
  const [timeline, setTimeline] = useState<TimelineDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [finalBlueGold, setFinalBlueGold] = useState(0);
  const [finalRedGold, setFinalRedGold] = useState(0);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!matchId || !region) return;

      setLoading(true);
      setError(null);

      try {
        const response = await get<TimelineDto>(`/api/lol/match/${matchId}/timeline?region=${region}`);

        if (response.ok && response.data) {
          setTimeline(response.data);
          processTimelineData(response.data);
        } else {
          setError("No se pudo cargar la línea de tiempo");
        }
      } catch (err) {
        console.error("Error cargando la línea de tiempo:", err);
        setError("Error al cargar los datos de la partida");
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [matchId, region, get]);

  const processTimelineData = (timelineData: TimelineDto) => {
    if (!timelineData?.info?.frames) return;

    const processedData: ChartDataPoint[] = [];
    const blueTeamIds = [1, 2, 3, 4, 5]; // IDs 1-5 son equipo azul
    const redTeamIds = [6, 7, 8, 9, 10]; // IDs 6-10 son equipo rojo

    timelineData.info.frames.forEach((frame) => {
      const minutes = Math.floor(frame.timestamp / 60000);
      const seconds = Math.floor((frame.timestamp % 60000) / 1000);
      const timeLabel = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      let blueTeamGold = 0;
      let redTeamGold = 0;

      Object.values(frame.participantFrames).forEach(participant => {
        if (blueTeamIds.includes(participant.participantId)) {
          blueTeamGold += participant.totalGold;
        } else if (redTeamIds.includes(participant.participantId)) {
          redTeamGold += participant.totalGold;
        }
      });

      processedData.push({
        time: timeLabel,
        timeRaw: frame.timestamp,
        blueTeamGold,
        redTeamGold,
        goldDiff: blueTeamGold - redTeamGold
      });
    });

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

  const CustomTooltip: React.FC<CustomTooltipProps> = ({active, payload, label}) => {
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


  const maxGold = Math.max(...chartData.map(data => Math.max(data.blueTeamGold, data.redTeamGold)));
  const yAxisDomain = [0, Math.ceil(maxGold / 10000) * 10000];

  return (
    <div className="bg-[#1e293b]/80 rounded-lg p-6 border border-blue-900/30">
      <h2 className="text-xl font-semibold mb-4">Evolución del oro por equipo</h2>

      <div className="w-full h-80 bg-[#0f172a]/80 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{top: 20, right: 30, left: 20, bottom: 10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis
              dataKey="time"
              tick={{fill: '#94a3b8'}}
              tickMargin={10}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yAxisDomain}
              tick={{fill: '#94a3b8'}}
              tickFormatter={(value) => (value / 1000) + 'k'}
            />
            <Tooltip content={<CustomTooltip/>}/>
            <Legend
              formatter={(value) => (
                <span style={{color: value === 'blueTeamGold' ? '#3b82f6' : '#ef4444'}}>
                  {value === 'blueTeamGold' ? 'Equipo Azul' : 'Equipo Rojo'}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="blueTeamGold"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{r: 5}}
              name="blueTeamGold"
            />
            <Line
              type="monotone"
              dataKey="redTeamGold"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{r: 5}}
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