package me.arycer.leaguetracker.entity.riot.misc

import me.arycer.leaguetracker.entity.riot.league.LeagueEntryDTO

class LTProfileDto {
    var username: String? = null
    var tagline: String? = null
    var level: Long = 0
    var profileIconId = 0
    var soloRankedInfo: LeagueEntryDTO? = null
    var flexRankedInfo: LeagueEntryDTO? = null
    var gameVersion: String? = null
}
