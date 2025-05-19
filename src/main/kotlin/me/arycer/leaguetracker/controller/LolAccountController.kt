package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.service.LolAccountService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/lol/accounts")
class LolAccountController(
    private val service: LolAccountService
) {

    data class LinkRequest(val summonerName: String, val tagline: String, val region: Region)

    @PostMapping("/link")
    fun linkAccount(
        principal: Principal,
        @RequestBody body: LinkRequest
    ): ResponseEntity<Map<String, Any>> {
        val userId = principal.name
        val icon = service.linkAccount(userId, body.summonerName, body.tagline, body.region)
        return ResponseEntity.ok(mapOf("requiredIcon" to icon))
    }

    @PostMapping("/verify")
    fun verifyAccount(
        principal: Principal
    ): ResponseEntity<Map<String, Any>> {
        val userId = principal.name
        val result = service.verifyPendingAccount(userId)
        return ResponseEntity.ok(mapOf("verified" to result))
    }

    @GetMapping("/accounts")
    fun getLinkedAccounts(
        principal: Principal
    ): ResponseEntity<Any> {
        val userId = principal.name
        return ResponseEntity.ok(service.getAccounts(userId))
    }
}
