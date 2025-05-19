package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.dto.misc.SummonerProfileDTO
import me.arycer.leaguetracker.service.RiotService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/profiles")
class ProfileController(
    private val riotService: RiotService
) {

    @GetMapping("/{region}/{name}/{tagline}")
    fun getProfile(
        @PathVariable region: Region,
        @PathVariable name: String,
        @PathVariable tagline: String
    ): ResponseEntity<SummonerProfileDTO> {
        val summoner = riotService.getSummonerByRiotId(name, tagline, region)
        val entries = riotService.fetchLeagueEntries(region, summoner.id)

        val profile = SummonerProfileDTO(
            name = summoner.name ?: "$name#$tagline",
            summonerLevel = summoner.summonerLevel,
            profileIconId = summoner.profileIconId,
            leagueEntries = entries.toList(),
            region = region
        )

        return ResponseEntity.ok(profile)
    }
}
