package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.service.FriendRequestService
import me.arycer.leaguetracker.service.PresenceService
import me.arycer.leaguetracker.service.UserService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/api/presence")
class PresenceController(
    private val presenceService: PresenceService,
    private val userService: UserService,
    private val friendsService: FriendRequestService
) {

    @GetMapping("/is-online/{username}")
    fun isUserOnline(
        principal: Principal,
        @PathVariable username: String
    ): Map<String, Any> {
        val userId = principal.name
        val requesterUsername = userService.getUsernameById(userId)

        if (requesterUsername == null || !friendsService.isFriends(requesterUsername, username)) {
            return mapOf(
                "username" to username,
                "online" to false
            )
        }

        val online = presenceService.isOnline(username)
        return mapOf(
            "username" to username,
            "online" to online
        )
    }
}
