package me.arycer.leaguetracker.dto.match

data class TeamDto(
    val bans: List<BanDto> = emptyList(),
    val objectives: ObjectivesDto = ObjectivesDto(),
    val teamId: Int = 0,
    val win: Boolean = false
)
