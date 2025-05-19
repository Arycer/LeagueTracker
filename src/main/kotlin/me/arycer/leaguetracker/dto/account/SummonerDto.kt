package me.arycer.leaguetracker.dto.account

import lombok.ToString

@ToString
class SummonerDto {
    var id: String? = null
    var name: String? = null
    var profileIconId = 0
    var summonerLevel: Long = 0
}