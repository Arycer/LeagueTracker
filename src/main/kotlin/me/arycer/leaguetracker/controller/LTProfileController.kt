package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.leaguetracker.LTProfileDto
import me.arycer.leaguetracker.dto.leaguetracker.Region
import me.arycer.leaguetracker.service.LTProfilesService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("/api/lol/profile")
class LTProfileController(private val profilesService: LTProfilesService) {
    @GetMapping("/{region}/{accountName}/{tagline}")
    fun getSummonerByName(
        @PathVariable region: String,
        @PathVariable accountName: String?,
        @PathVariable tagline: String?
    ): ResponseEntity<LTProfileDto?> {
        val regionEnum = Region.valueOf(region.uppercase(Locale.getDefault()))
        val summoner = profilesService.getProfile(regionEnum, accountName, tagline)
        return ResponseEntity.ok<LTProfileDto?>(summoner)
    }
}