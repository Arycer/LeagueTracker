// Tipos globales para la aplicación LeagueTracker

export type Region = {
  descriptor: string;
  policy: string;
  apiName: string;
  name: string;
};

// Re-exportamos los tipos de match para que estén disponibles desde @/types
export type { MatchDto, ParticipantDto, TeamDto } from './types/match';
