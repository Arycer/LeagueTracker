package me.arycer.leaguetracker.service

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import me.arycer.leaguetracker.config.ApiKeyLoader
import me.arycer.leaguetracker.dto.account.RiotAccountDto
import me.arycer.leaguetracker.dto.account.SummonerDto
import me.arycer.leaguetracker.dto.league.LeagueEntryDTO
import me.arycer.leaguetracker.dto.misc.Region
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.exchange

@Service
class RiotService(
    private val restTemplate: RestTemplate = RestTemplate()
) {

    fun getSummonerId(summonerName: String, tagline: String, region: Region): String {
        val url = "https://${
            region.policy.toString().lowercase()
        }.api.riotgames.com/riot/account/v1/accounts/by-riot-id/$summonerName/$tagline"

        val response = restTemplate.exchange<RiotAccountResponse>(
            url,
            HttpMethod.GET,
            buildAuthHeader(),
        )

        return response.body?.puuid ?: throw RuntimeException("Summoner not found")
    }

    // 2. Obtener el profileIconId actual
    fun getCurrentProfileIconId(summonerName: String, tagline: String, region: Region): Int {
        val puuid = getSummonerId(summonerName, tagline, region)
        val url = "https://${region.apiName}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/$puuid"

        val response = restTemplate.exchange<SummonerResponse>(
            url,
            HttpMethod.GET,
            buildAuthHeader(),
        )

        return response.body?.profileIconId ?: throw RuntimeException("Profile icon not found")
    }

    fun getSummonerByRiotId(name: String, tagline: String, region: Region): SummonerDto {
        val puuid = getSummonerId(name, tagline, region)
        val url = "https://${region.apiName}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/$puuid"

        val response = restTemplate.exchange<SummonerDto>(
            url,
            HttpMethod.GET,
            buildAuthHeader(),
        )

        println("Riot API response: $response")

        return response.body ?: throw RuntimeException("Summoner not found")
    }

    fun fetchLeagueEntries(region: Region, encryptedSummonerId: String?): Array<LeagueEntryDTO> {
        val url = "https://${region.apiName}.api.riotgames.com/lol/league/v4/entries/by-summoner/$encryptedSummonerId"

        val response = restTemplate.exchange<Array<LeagueEntryDTO>>(
            url,
            HttpMethod.GET,
            buildAuthHeader(),
        )

        return response.body ?: arrayOf()
    }

    // 3. Elegir un icono predeterminado aleatorio
    fun pickRandomDefaultIcon(): Int {
        val defaultIcons = listOf(
            0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 13, 14, 15, 16, 17, 18
        )
        return defaultIcons.random()
    }

    private fun buildAuthHeader(): HttpEntity<Void> {
        val headers = HttpHeaders()
        headers.set("X-Riot-Token", ApiKeyLoader.apiKey)
        return HttpEntity(headers)
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class RiotAccountResponse(
        val puuid: String
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class SummonerResponse(
        val profileIconId: Int
    )
}
