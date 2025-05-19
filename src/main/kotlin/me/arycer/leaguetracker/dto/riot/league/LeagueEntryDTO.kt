package me.arycer.leaguetracker.dto.riot.league

import lombok.Data

@Data
class LeagueEntryDTO {
    private val leagueId: String? = null
    private val summonerId: String? = null
    private val queueType: String? = null
    private val tier: String? = null
    private val rank: String? = null
    private val leaguePoints = 0
    private val wins = 0
    private val losses = 0
    private val hotStreak = false
    private val veteran = false
    private val freshBlood = false
    private val inactive = false
    private val miniSeries: MiniSeriesDTO? = null
}