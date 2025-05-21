package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.service.RiotService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/lol/version")
class LolVersionController(private val service: RiotService) {
    @GetMapping("/latest")
    fun getLatestVersion(): ResponseEntity<Map<String, String>> {
        val latest = service.fetchVersions().versions?.get(0) ?: "desconocida"
        return ResponseEntity.ok(mapOf("version" to latest))
    }
}
