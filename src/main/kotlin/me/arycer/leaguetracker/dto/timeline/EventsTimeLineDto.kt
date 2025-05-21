package me.arycer.leaguetracker.dto.timeline

data class EventsTimeLineDto(
    val timestamp: Long,
    val realTimestamp: Long,
    val type: String
)
