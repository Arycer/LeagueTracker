package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.client.RiotApiClient
import me.arycer.leaguetracker.entity.riot.misc.LTProfileDto
import me.arycer.leaguetracker.entity.riot.misc.Region
import me.arycer.leaguetracker.entity.riot.league.LeagueEntryDTO
import org.springframework.stereotype.Service

@Service
class LTProfilesService(private val riotApiClient: RiotApiClient) {
    fun getProfile(region: Region, accountName: String?, tagline: String?): LTProfileDto {
        val riotAccount = riotApiClient.fetchRiotAccount(region, accountName, tagline)
        val summoner = riotApiClient.fetchSummonerByPuuid(region, riotAccount.puuid!!)

        val ltProfileDto = LTProfileDto()
        ltProfileDto.username = riotAccount.gameName
        ltProfileDto.tagline = riotAccount.tagLine
        ltProfileDto.profileIconId = summoner.profileIconId
        ltProfileDto.level = summoner.summonerLevel
        ltProfileDto.gameVersion = riotApiClient.fetchVersions().versions!![0]

        val leagueEntries = riotApiClient.fetchLeagueEntries(region, summoner.id)

        var soloQ: LeagueEntryDTO? = null
        for (leagueEntry in leagueEntries) {
            if (leagueEntry.queueType == "RANKED_SOLO_5x5") {
                soloQ = leagueEntry
                break
            }
        }

        var flexQ: LeagueEntryDTO? = null
        for (leagueEntry in leagueEntries) {
            if (leagueEntry.queueType == "RANKED_FLEX_SR") {
                flexQ = leagueEntry
                break
            }
        }

        if (soloQ != null) {
            ltProfileDto.soloRankedInfo = soloQ
        }

        if (flexQ != null) {
            ltProfileDto.flexRankedInfo = flexQ
        }

        return ltProfileDto
    }
}