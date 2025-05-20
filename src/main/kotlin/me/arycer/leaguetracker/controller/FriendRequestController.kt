package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.entity.FriendRequest
import me.arycer.leaguetracker.service.FriendRequestService
import me.arycer.leaguetracker.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/friends")
class FriendRequestController(
    private val friendRequestService: FriendRequestService,
    private val userService: UserService
) {

    @GetMapping
    fun getFriends(principal: Principal): ResponseEntity<List<String>> {
        val userId = principal.name
        val username = userService.getUsernameById(userId)

        if (username == null) {
            return ResponseEntity.badRequest().body(emptyList())
        }

        val friends = friendRequestService.getFriends(username)
        return ResponseEntity.ok(friends)
    }

    @PostMapping("/requests/{recipientUsername}")
    fun sendRequest(
        principal: Principal,
        @PathVariable recipientUsername: String
    ): ResponseEntity<FriendRequest> {
        val requesterId = principal.name
        val requester = userService.getUsernameById(requesterId)
        if (requester == null || !userService.existsByUsername(recipientUsername)) {
            println("Requester or recipient not found")
            return ResponseEntity.badRequest().build()
        }

        val request = friendRequestService.sendRequest(requester, recipientUsername)
        return ResponseEntity.ok(request)
    }

    @GetMapping("/requests/incoming")
    fun incomingRequests(principal: Principal): ResponseEntity<List<FriendRequest>> {
        val requesterId = principal.name
        val username = userService.getUsernameById(requesterId)

        if (username == null) {
            return ResponseEntity.badRequest().build()
        }

        val requests = friendRequestService.getIncomingRequests(username)
        return ResponseEntity.ok(requests)
    }

    @GetMapping("/requests/outgoing")
    fun outgoingRequests(principal: Principal): ResponseEntity<List<FriendRequest>> {
        val requesterId = principal.name
        val username = userService.getUsernameById(requesterId)

        if (username == null) {
            return ResponseEntity.badRequest().build()
        }

        val requests = friendRequestService.getOutgoingRequests(username)
        return ResponseEntity.ok(requests)
    }

    @PostMapping("/requests/{requesterUsername}/respond")
    fun respondRequest(
        principal: Principal,
        @PathVariable requesterUsername: String,
        @RequestParam accept: Boolean
    ): ResponseEntity<FriendRequest> {
        val recipientId = principal.name
        val recipientUsername = userService.getUsernameById(recipientId)
        if (recipientUsername == null || !userService.existsByUsername(requesterUsername)) {
            println("Recipient or requester not found")
            return ResponseEntity.badRequest().build()
        }
        val response = friendRequestService.respondRequest(requesterUsername, recipientUsername, accept)
        return ResponseEntity.ok(response)
    }


    @DeleteMapping("/delete/{friendUsername}")
    fun removeFriend(principal: Principal, @PathVariable friendUsername: String): ResponseEntity<Void> {
        val id = principal.name
        val username = userService.getUsernameById(id)

        if (username == null) {
            return ResponseEntity.badRequest().build()
        }

        val friend = userService.getUsernameById(friendUsername)
        if (friend == null) {
            return ResponseEntity.badRequest().build()
        }

        friendRequestService.removeFriend(username, friend)
        return ResponseEntity.noContent().build()
    }
}