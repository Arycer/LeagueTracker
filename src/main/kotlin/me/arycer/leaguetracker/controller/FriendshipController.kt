package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.service.FriendshipService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/friends")
class FriendshipController(
    private val friendshipService: FriendshipService
) {

    @GetMapping("/{userId}")
    fun getFriends(@PathVariable userId: String): ResponseEntity<List<String>> {
        val friends = friendshipService.getFriends(userId)
        return ResponseEntity.ok(friends)
    }

    @PostMapping("/{userId}/add/{friendId}")
    fun addFriend(@PathVariable userId: String, @PathVariable friendId: String): ResponseEntity<String> {
        return if (friendshipService.addFriend(userId, friendId)) {
            ResponseEntity.ok("Friend added")
        } else {
            ResponseEntity.badRequest().body("Failed to add friend")
        }
    }

    @DeleteMapping("/{userId}/remove/{friendId}")
    fun removeFriend(@PathVariable userId: String, @PathVariable friendId: String): ResponseEntity<String> {
        return if (friendshipService.removeFriend(userId, friendId)) {
            ResponseEntity.ok("Friend removed")
        } else {
            ResponseEntity.badRequest().body("Failed to remove friend")
        }
    }
}
