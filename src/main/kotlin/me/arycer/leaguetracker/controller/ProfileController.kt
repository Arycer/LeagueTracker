package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.dto.misc.SummonerProfileDTO
import me.arycer.leaguetracker.service.LolProfileCacheService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/profiles")
class ProfileController(
    private val lolProfileCacheService: LolProfileCacheService
) {

    @GetMapping("/{region}/{name}/{tagline}")
    fun getProfile(
        @PathVariable region: Region,
        @PathVariable name: String,
        @PathVariable tagline: String
    ): ResponseEntity<SummonerProfileDTO> {
        val profile = lolProfileCacheService.getProfile(region, name, tagline)
        return ResponseEntity.ok(profile)
    }

    @PostMapping("/{region}/{name}/{tagline}/refresh")
    fun refreshProfile(
        @PathVariable region: Region,
        @PathVariable name: String,
        @PathVariable tagline: String
    ): ResponseEntity<SummonerProfileDTO> {
        try {
            val profile = lolProfileCacheService.refreshProfile(region, name, tagline)
            return ResponseEntity.ok(profile)
        } catch (_: RuntimeException) {
            return ResponseEntity.badRequest().body(null)
        }
    }
}
