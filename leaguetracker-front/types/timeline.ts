export interface TimelineDto {
  metadata: MetadataTimeLineDto;
  info: InfoTimeLineDto;
}

export interface MetadataTimeLineDto {
  dataVersion: string;
  matchId: string;
  participants: string[];
}

export interface InfoTimeLineDto {
  endOfGameResult: string;
  frameInterval: number;
  gameId: number;
  participants: ParticipantTimeLineDto[];
  frames: FramesTimeLineDto[];
}

export interface ParticipantTimeLineDto {
  participantId: number;
  puuid: string;
}

export interface FramesTimeLineDto {
  events: EventsTimeLineDto[];
  participantFrames: Record<string, ParticipantFrameDto>;
  timestamp: number;
}

export interface EventsTimeLineDto {
  timestamp: number;
  realTimestamp: number;
  type: string;
}

export interface ParticipantFrameDto {
  championStats: ChampionStatsDto;
  currentGold: number;
  damageStats: DamageStatsDto;
  goldPerSecond: number;
  jungleMinionsKilled: number;
  level: number;
  minionsKilled: number;
  participantId: number;
  position: PositionDto;
  timeEnemySpentControlled: number;
  totalGold: number;
  xp: number;
}

export interface ChampionStatsDto {
  abilityHaste: number;
  abilityPower: number;
  armor: number;
  armorPen: number;
  armorPenPercent: number;
  attackDamage: number;
  attackSpeed: number;
  bonusArmorPenPercent: number;
  bonusMagicPenPercent: number;
  ccReduction: number;
  cooldownReduction: number;
  health: number;
  healthMax: number;
  healthRegen: number;
  lifesteal: number;
  magicPen: number;
  magicPenPercent: number;
  magicResist: number;
  movementSpeed: number;
  omnivamp: number;
  physicalVamp: number;
  power: number;
  powerMax: number;
  powerRegen: number;
  spellVamp: number;
}

export interface DamageStatsDto {
  magicDamageDone: number;
  magicDamageDoneToChampions: number;
  magicDamageTaken: number;
  physicalDamageDone: number;
  physicalDamageDoneToChampions: number;
  physicalDamageTaken: number;
  totalDamageDone: number;
  totalDamageDoneToChampions: number;
  totalDamageTaken: number;
  trueDamageDone: number;
  trueDamageDoneToChampions: number;
  trueDamageTaken: number;
}

export interface PositionDto {
  x: number;
  y: number;
}
  