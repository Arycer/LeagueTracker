package me.arycer.leaguetracker.dto.leaguetracker

import lombok.Data
import me.arycer.leaguetracker.dto.riot.league.LeagueEntryDTO

@Data
class LTProfileDto {
    private val username: String? = null
    private val tagline: String? = null
    private val level: Long = 0
    private val profileIconId = 0
    private val soloRankedInfo: LeagueEntryDTO? = null
    private val flexRankedInfo: LeagueEntryDTO? = null
    private val gameVersion: String? = null
}
