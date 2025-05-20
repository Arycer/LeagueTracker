import React, { useEffect, useState } from "react";
import { useLolVersion } from "@/context/LolVersionContext";

type ChampionMasteryDto = {
  championId: number;
  championLevel: number;
  championPoints: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  tokensEarned: number;
  summonerId: string;
};

type ChampionMasteryTop3Props = {
  region: string;
  name: string;
  tagline: string;
};

const CHAMPION_IMG_URL = (championName: string, version: string) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;

const ChampionMasteryTop3: React.FC<ChampionMasteryTop3Props> = ({ region, name, tagline }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [masteries, setMasteries] = useState<ChampionMasteryDto[]>([]);
  const { version: lolVersion } = useLolVersion();
  const [championIdToName, setChampionIdToName] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8080/api/champion-mastery/top3/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tagline)}`)
      .then(res => res.ok ? res.json() : Promise.reject("Error al cargar maestrías"))
      .then((data: ChampionMasteryDto[]) => setMasteries(data))
      .catch(err => setError(typeof err === "string" ? err : "Error"))
      .finally(() => setLoading(false));
  }, [region, name, tagline]);

  useEffect(() => {
    if (!lolVersion) return;
    fetch(`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/data/es_ES/champion.json`)
      .then(res => res.json())
      .then(data => {
        const mapping: Record<number, string> = {};
        Object.values(data.data).forEach((champ: any) => {
          mapping[parseInt(champ.key)] = champ.id;
        });
        setChampionIdToName(mapping);
      });
  }, [lolVersion]);

  if (loading) return <div className="text-gray-500">Cargando maestrías...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!masteries.length) return <div className="text-gray-400">No hay datos de maestría.</div>;

  return (
    <div className="flex flex-col items-center bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex gap-4">
        {masteries.map((m) => (
          <div key={m.championId} className="flex flex-col items-center">
            {championIdToName[m.championId] && (
              <img
                src={CHAMPION_IMG_URL(championIdToName[m.championId], lolVersion)}
                alt={championIdToName[m.championId]}
                className="w-16 h-16 rounded-full border-2 border-yellow-400 mb-1"
              />
            )}
            <div className="font-semibold text-sm mb-1">
              {championIdToName[m.championId] || `ID ${m.championId}`}
            </div>
            <div className="text-xs text-gray-700">Nivel {m.championLevel}</div>
            <div className="text-xs text-yellow-700">{m.championPoints.toLocaleString()} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChampionMasteryTop3;
