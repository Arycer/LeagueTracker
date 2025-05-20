package me.arycer.leaguetracker.dto.match

data class PerksDto(
    val statPerks: PerkStatsDto = PerkStatsDto(),
    val styles: List<PerkStyleSelectionDto> = emptyList()
)