package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.misc.MainLolAccountDto
import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.entity.LolAccount
import me.arycer.leaguetracker.entity.PendingLolAccount
import me.arycer.leaguetracker.service.FriendRequestService
import me.arycer.leaguetracker.service.LolAccountService
import me.arycer.leaguetracker.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/lol/accounts")
class LolAccountController(
    private val service: LolAccountService,
    private val friendRequestService: FriendRequestService,
    private val userService: UserService
) {

    data class LinkRequest(val summonerName: String, val tagline: String, val region: Region)

    @PostMapping("/link")
    fun linkAccount(
        principal: Principal,
        @RequestBody body: LinkRequest
    ): ResponseEntity<Map<String, Any>> {
        try {
            val userId = principal.name
            val icon = service.linkAccount(userId, body.summonerName, body.tagline, body.region)
            return ResponseEntity.ok(mapOf("requiredIcon" to icon))
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(mapOf("error" to e.message.toString()))
        }
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

    @GetMapping("/pending")
    fun getPendingAccounts(principal: Principal): ResponseEntity<List<PendingLolAccount>> {
        val userId = principal.name
        val pendingAccounts = service.getPendingAccounts(userId)
        return ResponseEntity.ok(pendingAccounts)
    }

    @DeleteMapping("/pending/{id}")
    fun deletePendingAccount(
        principal: Principal,
        @PathVariable id: String
    ): ResponseEntity<Void> {
        val userId = principal.name
        service.deletePendingAccount(userId, id)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{id}")
    fun unlinkAccount(
        principal: Principal,
        @PathVariable id: String
    ): ResponseEntity<Void> {
        val userId = principal.name
        service.unlinkAccount(userId, id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{accountId}/set-main")
    fun setMainAccount(
        principal: Principal,
        @PathVariable accountId: String
    ): ResponseEntity<Void> {
        val userId = principal.name
        service.setMainAccount(userId, accountId)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/main")
    fun getMainAccount(principal: Principal): ResponseEntity<LolAccount?> {
        val userId = principal.name
        val main = service.getMainAccount(userId)
        return ResponseEntity.ok(main)
    }

    @GetMapping("/main/{friendUsername}")
    fun getFriendMainAccount(
        principal: Principal,
        @PathVariable friendUsername: String
    ): ResponseEntity<MainLolAccountDto?> {
        val userId = principal.name
        val username = userService.getUsernameById(userId)
            ?: return ResponseEntity.badRequest().build()

        val friends = friendRequestService.getFriends(username)
        if (!friends.contains(friendUsername)) {
            return ResponseEntity.status(403).build() 
        }

        val friendUser = userService.getUserByUsername(friendUsername)
            ?: return ResponseEntity.badRequest().build()

        val mainAccount = service.getMainAccountOfUser(friendUser.id)
        return ResponseEntity.ok(mainAccount)
    }


}
