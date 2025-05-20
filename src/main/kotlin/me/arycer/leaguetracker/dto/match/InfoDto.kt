package me.arycer.leaguetracker.dto.match

data class InfoDto(
    val endOfGameResult: String,
    val gameCreation: Long,
    val gameDuration: Long,
    val gameEndTimestamp: Long,
    val gameId: Long,
    val gameMode: String,
    val gameName: String,
    val gameStartTimestamp: Long,
    val gameType: String,
    val gameVersion: String,
    val mapId: Int,
    val participants: List<ParticipantDto>,
    val platformId: String,
    val queueId: Int,
    val teams: List<TeamDto>,
    val tournamentCode: String?
)
