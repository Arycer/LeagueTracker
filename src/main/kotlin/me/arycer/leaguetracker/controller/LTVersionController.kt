package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.riot.ddragon.VersionsDTO
import me.arycer.leaguetracker.service.LTVersionService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/lol/version")
class LTVersionController(private val versionService: LTVersionService) {
    @get:GetMapping("")
    val summonerByName: ResponseEntity<VersionsDTO?>
        get() {
            val versions = versionService.versions
            return ResponseEntity.ok<VersionsDTO?>(versions)
        }

    @GetMapping("/latest")
    fun getLatestVersion(): ResponseEntity<Map<String, String>> {
        val latest = versionService.versions.versions?.get(0) ?: "desconocida"
        return ResponseEntity.ok(mapOf("version" to latest))
    }

}
