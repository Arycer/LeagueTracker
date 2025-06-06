package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.mastery.ChampionMasteryDto
import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.service.ChampionMasteryCacheService
import me.arycer.leaguetracker.service.RiotService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/champion-mastery")
class ChampionMasteryController(
    private val riotService: RiotService,
    private val championMasteryService: ChampionMasteryCacheService
) {

    @GetMapping("/top3/{region}/{name}/{tagline}")
    fun getTop3ChampionMasteries(
        @PathVariable region: Region,
        @PathVariable name: String,
        @PathVariable tagline: String
    ): ResponseEntity<List<ChampionMasteryDto>> {
        val puuid = riotService.getSummonerId(name, tagline, region)
        if (puuid.isEmpty()) {
            return ResponseEntity.badRequest().body(emptyList())
        }
        val top3Masteries = championMasteryService.getTop3ChampionMasteries(puuid, region)
        return ResponseEntity.ok(top3Masteries)
    }
}
