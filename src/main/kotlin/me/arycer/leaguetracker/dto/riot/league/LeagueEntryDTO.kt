package me.arycer.leaguetracker.dto.riot.league

class LeagueEntryDTO {
    var leagueId: String? = null
    var summonerId: String? = null
    var queueType: String? = null
    var tier: String? = null
    var rank: String? = null
    var leaguePoints = 0
    var wins = 0
    var losses = 0
    var hotStreak = false
    var veteran = false
    var freshBlood = false
    var inactive = false
    var miniSeries: MiniSeriesDTO? = null
}