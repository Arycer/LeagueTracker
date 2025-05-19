package me.arycer.leaguetracker.dto.riot.account

import lombok.Data

@Data
class SummonerDto {
    private val id: String? = null
    private val name: String? = null
    private val profileIconId = 0
    private val summonerLevel: Long = 0
}