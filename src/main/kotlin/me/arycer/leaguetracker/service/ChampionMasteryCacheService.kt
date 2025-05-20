package me.arycer.leaguetracker.service

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.transaction.Transactional
import me.arycer.leaguetracker.dto.mastery.ChampionMasteryDto
import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.entity.ChampionMasteryCache
import me.arycer.leaguetracker.repository.ChampionMasteryCacheRepository
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.exchange

@Service
class ChampionMasteryCacheService(
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper,
    private val championMasteryCacheRepository: ChampionMasteryCacheRepository,
    private val riotService: RiotService,
) {

    private val cacheCooldownMillis = 5 * 60 * 1000L // 5 minutos

    @Transactional
    fun getTop3ChampionMasteries(puuid: String, region: Region): List<ChampionMasteryDto> {
        val now = System.currentTimeMillis()
        val cached = championMasteryCacheRepository.findByPuuid(puuid)

        if (cached != null && (now - cached.lastUpdated) < cacheCooldownMillis) {
            // Cache válido
            return objectMapper.readValue(cached.masteryJson, Array<ChampionMasteryDto>::class.java).take(3)
        }

        // Cache no válido o no existe: pedir a Riot y guardar
        val url =
            "https://${region.apiName}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/$puuid/top"
        val response =
            restTemplate.exchange<Array<ChampionMasteryDto>>(url, HttpMethod.GET, riotService.buildAuthHeader())
        if (response.statusCode.isError) {
            throw RuntimeException("Error fetching mastery data: ${response.statusCode}")
        }

        val masteries = response.body ?: emptyArray()

        val masteryJson = objectMapper.writeValueAsString(masteries)
        val newCache = ChampionMasteryCache(
            puuid = puuid,
            masteryJson = masteryJson,
            lastUpdated = now
        )
        championMasteryCacheRepository.save(newCache)

        return masteries.take(3)
    }
}
