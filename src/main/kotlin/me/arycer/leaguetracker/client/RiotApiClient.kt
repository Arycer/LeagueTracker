package me.arycer.leaguetracker.client

import me.arycer.leaguetracker.config.ApiKeyLoader
import me.arycer.leaguetracker.dto.account.RiotAccountDto
import me.arycer.leaguetracker.dto.account.SummonerDto
import me.arycer.leaguetracker.dto.ddragon.VersionsDTO
import me.arycer.leaguetracker.dto.league.LeagueEntryDTO
import me.arycer.leaguetracker.dto.misc.Region
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate

@Component
class RiotApiClient(private val restTemplate: RestTemplate) {

    fun fetchSummonerByPuuid(region: Region, puuid: String): SummonerDto {
        val url: String = "https://%s.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/%s?api_key=%s"
            .format(region.apiName, puuid, ApiKeyLoader.apiKey)
        return restTemplate.getForObject(url, SummonerDto::class.java) ?: SummonerDto()
    }

    fun fetchRiotAccount(region: Region, accountName: String?, tagline: String?): RiotAccountDto {
        val url: String = "https://%s.api.riotgames.com/riot/account/v1/accounts/by-riot-id/%s/%s?api_key=%s"
            .format(region.policy.toString().lowercase(), accountName, tagline, ApiKeyLoader.apiKey)
        return restTemplate.getForObject(url, RiotAccountDto::class.java) ?: RiotAccountDto()
    }

    fun fetchLeagueEntries(region: Region, encryptedSummonerId: String?): Array<LeagueEntryDTO> {
        val url: String = "https://%s.api.riotgames.com/lol/league/v4/entries/by-summoner/%s?api_key=%s"
            .format(region.apiName, encryptedSummonerId, ApiKeyLoader.apiKey)
        return restTemplate.getForObject(url, Array<LeagueEntryDTO>::class.java) ?: arrayOf()
    }

    fun fetchVersions(): VersionsDTO {
        val url = "https://ddragon.leagueoflegends.com/api/versions.json"
        val versions: Array<String> = restTemplate.getForObject(url, Array<String>::class.java) ?: arrayOf()
        val versionsDTO = VersionsDTO()
        versionsDTO.versions = versions
        return versionsDTO
    }
}