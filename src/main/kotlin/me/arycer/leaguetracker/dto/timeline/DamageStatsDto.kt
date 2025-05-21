package me.arycer.leaguetracker.dto.timeline

data class DamageStatsDto(
    val magicDamageDone: Int,
    val magicDamageDoneToChampions: Int,
    val magicDamageTaken: Int,
    val physicalDamageDone: Int,
    val physicalDamageDoneToChampions: Int,
    val physicalDamageTaken: Int,
    val totalDamageDone: Int,
    val totalDamageDoneToChampions: Int,
    val totalDamageTaken: Int,
    val trueDamageDone: Int,
    val trueDamageDoneToChampions: Int,
    val trueDamageTaken: Int
)
