package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.entity.leaguetracker.FriendRequest
import me.arycer.leaguetracker.service.FriendRequestService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/friends")
class FriendRequestController(private val friendRequestService: FriendRequestService) {

    @GetMapping
    fun getFriends(principal: Principal): ResponseEntity<List<String>> {
        val userId = principal.name
        val friends = friendRequestService.getFriends(userId)
        return ResponseEntity.ok(friends)
    }

    @PostMapping("/requests/{recipientId}")
    fun sendRequest(
        principal: Principal,
        @PathVariable recipientId: String
    ): ResponseEntity<FriendRequest> {
        val requesterId = principal.name
        val request = friendRequestService.sendRequest(requesterId, recipientId)
        return ResponseEntity.ok(request)
    }

    @GetMapping("/requests/incoming")
    fun incomingRequests(principal: Principal): ResponseEntity<List<FriendRequest>> {
        val userId = principal.name
        val requests = friendRequestService.getIncomingRequests(userId)
        return ResponseEntity.ok(requests)
    }

    @GetMapping("/requests/outgoing")
    fun outgoingRequests(principal: Principal): ResponseEntity<List<FriendRequest>> {
        val userId = principal.name
        val requests = friendRequestService.getOutgoingRequests(userId)
        return ResponseEntity.ok(requests)
    }

    @PostMapping("/requests/{requesterId}/respond")
    fun respondRequest(
        principal: Principal,
        @PathVariable requesterId: String,
        @RequestParam accept: Boolean
    ): ResponseEntity<FriendRequest> {
        val recipientId = principal.name
        val response = friendRequestService.respondRequest(requesterId, recipientId, accept)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/delete/{friendId}")
    fun removeFriend(principal: Principal, @PathVariable friendId: String): ResponseEntity<Void> {
        val userId = principal.name
        friendRequestService.removeFriend(userId, friendId)
        return ResponseEntity.noContent().build()
    }
}