package me.arycer.leaguetracker.service

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.transaction.Transactional
import me.arycer.leaguetracker.dto.match.MatchDto
import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.entity.MatchCache
import me.arycer.leaguetracker.repository.MatchCacheRepository
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.exchange

@Service
class MatchCacheService(
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper,
    private val matchCacheRepository: MatchCacheRepository,
) {

    @Transactional
    fun getMatchInfoByMatchId(matchId: String, region: Region): MatchDto {
        val cached = matchCacheRepository.findById(matchId).orElse(null)
        if (cached != null) {
            return objectMapper.readValue(cached.matchJson, MatchDto::class.java)
        }

        val url = "https://${region.policy.toString().lowercase()}.api.riotgames.com/lol/match/v5/matches/$matchId"
        val response = restTemplate.exchange<MatchDto>(url, HttpMethod.GET, riotService.buildAuthHeader())
        if (response.statusCode.isError) {
            throw RuntimeException("Error fetching match data: ${response.statusCode}")
        }

        val match = response.body ?: throw RuntimeException("Match not found")
        val matchJson = objectMapper.writeValueAsString(match)
        matchCacheRepository.save(MatchCache(matchId = matchId, matchJson = matchJson, region = region))

        return match
    }

    lateinit var riotService: RiotService
}
