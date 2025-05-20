package me.arycer.leaguetracker.service

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.dto.mastery.ChampionMasteryDto
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.exchange

@Service
class ChampionMasteryService(
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper,
    private val riotService: RiotService,
) {

    fun getTop3ChampionMasteries(puuid: String, region: Region): List<ChampionMasteryDto> {
        val url =
            "https://${region.apiName}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/$puuid/top"

        val response = restTemplate.exchange<String>(
            url,
            HttpMethod.GET,
            riotService.buildAuthHeader(),
        )

        if (response.statusCode.isError) {
            throw RuntimeException("Error fetching champion mastery data: ${response.statusCode}")
        }

        val masteryList: List<ChampionMasteryDto> = objectMapper.readValue(
            response.body ?: "[]",
            object : TypeReference<List<ChampionMasteryDto>>() {}
        )

        // Retornar sólo las 3 primeras maestrías (top 3)
        return masteryList.take(3)
    }


}
