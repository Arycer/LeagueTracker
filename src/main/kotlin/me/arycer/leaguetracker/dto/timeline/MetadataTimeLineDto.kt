package me.arycer.leaguetracker.dto.timeline

data class MetadataTimeLineDto(
    val dataVersion: String,
    val matchId: String,
    val participants: List<String>
)
