package me.arycer.leaguetracker.dto.misc

import me.arycer.leaguetracker.dto.league.LeagueEntryDTO

data class SummonerProfileDTO(
    val name: String,
    val summonerLevel: Long,
    val profileIconId: Int,
    val leagueEntries: List<LeagueEntryDTO>,
    val region: Region
)
