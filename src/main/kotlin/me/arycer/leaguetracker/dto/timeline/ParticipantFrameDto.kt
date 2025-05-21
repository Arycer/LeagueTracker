package me.arycer.leaguetracker.dto.timeline

data class ParticipantFrameDto(
    val championStats: ChampionStatsDto,
    val currentGold: Int,
    val damageStats: DamageStatsDto,
    val goldPerSecond: Int,
    val jungleMinionsKilled: Int,
    val level: Int,
    val minionsKilled: Int,
    val participantId: Int,
    val position: PositionDto,
    val timeEnemySpentControlled: Int,
    val totalGold: Int,
    val xp: Int
)
