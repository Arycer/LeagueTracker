package me.arycer.leaguetracker.dto.match

data class MetadataDto(
    val dataVersion: String,
    val matchId: String,
    val participants: List<String>
)
