package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.leaguetracker.FriendRequest
import me.arycer.leaguetracker.entity.leaguetracker.FriendRequestId
import me.arycer.leaguetracker.entity.leaguetracker.FriendRequestStatus
import org.springframework.data.jpa.repository.JpaRepository

interface FriendRequestRepository : JpaRepository<FriendRequest, FriendRequestId> {
    fun findByRecipientIdAndStatus(recipientId: String, status: FriendRequestStatus): List<FriendRequest>
    fun findByRequesterIdAndStatus(requesterId: String, status: FriendRequestStatus): List<FriendRequest>
    fun existsByRequesterIdAndRecipientIdAndStatus(requesterId: String, recipientId: String, status: FriendRequestStatus): Boolean
    fun findByRequesterIdAndRecipientIdAndStatus(requesterId: String, recipientId: String, status: FriendRequestStatus): FriendRequest?
}
