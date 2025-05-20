package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.service.FriendRequestService
import me.arycer.leaguetracker.service.PresenceService
import me.arycer.leaguetracker.service.UserService
import org.springframework.web.bind.annotation.*
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

        println("Requester: $requesterUsername, Target: $username")

        if (requesterUsername == null || !friendsService.isFriends(requesterUsername, username)) {
            println("User $requesterUsername is not friends with $username")
            return mapOf(
                "username" to username,
                "online" to false
            )
        }

        val online = presenceService.isOnline(username)

        println("User $username is online: $online")

        return mapOf(
            "username" to username,
            "online" to online
        )
    }
}
