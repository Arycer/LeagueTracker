package me.arycer.leaguetracker.dto.match

data class PerkStyleDto(
    val description: String = "",
    val selections: List<PerkStyleSelectionDto> = emptyList(),
    val style: Int = 0
)
