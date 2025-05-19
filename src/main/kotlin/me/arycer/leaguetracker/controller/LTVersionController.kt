package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.riot.ddragon.VersionsDTO
import me.arycer.leaguetracker.service.LTVersionService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/league_version")
class LTVersionController(private val versionService: LTVersionService) {
    @get:GetMapping("")
    val summonerByName: ResponseEntity<VersionsDTO?>
        get() {
            val versions = versionService.versions
            return ResponseEntity.ok<VersionsDTO?>(versions)
        }

    @get:GetMapping("/latest")
    val latestVersion: ResponseEntity<String?>
        get() {
            val versions = versionService.versions
            return ResponseEntity.ok<String?>(versions.versions!![0])
        }
}
