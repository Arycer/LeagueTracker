package me.arycer.leaguetracker.service

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.transaction.Transactional
import me.arycer.leaguetracker.dto.league.LeagueEntryDTO
import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.dto.misc.SummonerProfileDTO
import me.arycer.leaguetracker.entity.LolProfileCache
import me.arycer.leaguetracker.repository.LolProfileCacheRepository
import org.springframework.stereotype.Service

@Service
class LolProfileCacheService(
    private val riotService: RiotService,
    private val lolProfileCacheRepository: LolProfileCacheRepository,
    private val objectMapper: ObjectMapper
) {

    private val cacheCooldownMillis = 5 * 60 * 1000L 
    private val refreshCooldownMillis = 30 * 1000L 

    @Transactional
    fun getProfile(region: Region, summonerName: String, tagline: String): SummonerProfileDTO {
        val key = buildKey(region, summonerName, tagline)
        val puuid = riotService.getSummonerId(summonerName, tagline, region)
        val now = System.currentTimeMillis()
        val cached = lolProfileCacheRepository.findByKey(key)

        if (cached != null && (now - cached.lastUpdated) < cacheCooldownMillis) {
            val leagueEntries =
                objectMapper.readValue(cached.leagueEntriesJson, Array<LeagueEntryDTO>::class.java).toList()
            return SummonerProfileDTO(
                name = cached.summonerName,
                tagline = tagline,
                puuid = puuid,
                summonerLevel = cached.summonerLevel,
                profileIconId = cached.profileIconId,
                leagueEntries = leagueEntries,
                region = cached.region
            )
        }

        println("Cache no válido o no existe. Obteniendo nuevo perfil...")
        return refreshProfile(region, summonerName, tagline, force = true)
    }

    @Transactional
    fun refreshProfile(
        region: Region,
        summonerName: String,
        tagline: String,
        force: Boolean = false
    ): SummonerProfileDTO {
        val key = buildKey(region, summonerName, tagline)
        val now = System.currentTimeMillis()
        val cached = lolProfileCacheRepository.findByKey(key)

        if (!force && cached != null && (now - cached.lastUpdated) < refreshCooldownMillis) {
            throw RuntimeException("Cooldown activo. Por favor espera para refrescar el perfil.")
        }

        val summoner = riotService.getSummonerByRiotId(summonerName, tagline, region)
        val puuid = riotService.getSummonerId(summonerName, tagline, region)
        val entries = riotService.fetchLeagueEntries(region, summoner.id)

        val cacheEntity = LolProfileCache(
            key = key,
            summonerName = summoner.name ?: "$summonerName#$tagline",
            summonerLevel = summoner.summonerLevel,
            profileIconId = summoner.profileIconId,
            leagueEntriesJson = objectMapper.writeValueAsString(entries),
            region = region,
            lastUpdated = now
        )
        lolProfileCacheRepository.save(cacheEntity)

        return SummonerProfileDTO(
            name = summonerName,
            tagline = tagline,
            puuid = puuid,
            summonerLevel = summoner.summonerLevel,
            profileIconId = summoner.profileIconId,
            leagueEntries = entries.toList(),
            region = region
        )
    }

    private fun buildKey(region: Region, name: String, tagline: String) =
        "${region.name}-$name-$tagline"
}
