package me.arycer.leaguetracker.dto.timeline

data class FramesTimeLineDto(
    val events: List<EventsTimeLineDto>,
    val participantFrames: Map<String, ParticipantFrameDto>,
    val timestamp: Int
)
