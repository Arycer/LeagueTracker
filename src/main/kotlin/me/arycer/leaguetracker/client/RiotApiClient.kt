package me.arycer.leaguetracker.client

import me.arycer.leaguetracker.config.ApiKeyLoader
import me.arycer.leaguetracker.dto.leaguetracker.Region
import me.arycer.leaguetracker.dto.riot.account.RiotAccountDto
import me.arycer.leaguetracker.dto.riot.account.SummonerDto
import me.arycer.leaguetracker.dto.riot.ddragon.VersionsDTO
import me.arycer.leaguetracker.dto.riot.league.LeagueEntryDTO
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate

@Component
class RiotApiClient(restTemplate: RestTemplate) {
    private val restTemplate: RestTemplate

    init {
        this.restTemplate = restTemplate
    }

    fun fetchSummonerByPuuid(region: Region, puuid: String?): SummonerDto {
        val url: String = "https://%s.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/%s?api_key=%s"
            .formatted(region.getApiName(), puuid, ApiKeyLoader.getApiKey())
        return restTemplate.getForObject(url, SummonerDto::class.java)
    }

    fun fetchRiotAccount(region: Region, accountName: String?, tagline: String?): RiotAccountDto {
        val url: String = "https://%s.api.riotgames.com/riot/account/v1/accounts/by-riot-id/%s/%s?api_key=%s".formatted(
            region.getPolicy().toString().toLowerCase(), accountName, tagline, ApiKeyLoader.getApiKey()
        )
        return restTemplate.getForObject(url, RiotAccountDto::class.java)
    }

    fun fetchLeagueEntries(region: Region, encryptedSummonerId: String?): Array<LeagueEntryDTO?> {
        val url: String = "https://%s.api.riotgames.com/lol/league/v4/entries/by-summoner/%s?api_key=%s"
            .formatted(region.getApiName(), encryptedSummonerId, ApiKeyLoader.getApiKey())
        return restTemplate.getForObject(url, Array<LeagueEntryDTO>::class.java)
    }

    fun fetchVersions(): VersionsDTO {
        val url = "https://ddragon.leagueoflegends.com/api/versions.json"
        val versions: Array<String?>? = restTemplate.getForObject(url, Array<String>::class.java)
        val versionsDTO: VersionsDTO = VersionsDTO()
        versionsDTO.setVersions(versions)
        return versionsDTO
    }
}