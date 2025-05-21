package me.arycer.leaguetracker.dto.timeline

data class InfoTimeLineDto(
    val endOfGameResult: String,
    val frameInterval: Long,
    val gameId: Long,
    val participants: List<ParticipantTimeLineDto>,
    val frames: List<FramesTimeLineDto>
)
