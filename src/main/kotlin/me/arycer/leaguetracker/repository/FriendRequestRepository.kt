package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.FriendRequest
import me.arycer.leaguetracker.entity.FriendRequestId
import me.arycer.leaguetracker.entity.FriendRequestStatus
import org.springframework.data.jpa.repository.JpaRepository

interface FriendRequestRepository : JpaRepository<FriendRequest, FriendRequestId> {
    fun findByRecipientUsernameAndStatus(recipientUsername: String, status: FriendRequestStatus): List<FriendRequest>
    fun findByRequesterUsernameAndStatus(requesterUsername: String, status: FriendRequestStatus): List<FriendRequest>
    fun existsByRequesterUsernameAndRecipientUsernameAndStatus(
        requesterUsername: String,
        recipientUsername: String,
        status: FriendRequestStatus
    ): Boolean

    fun findByRequesterUsernameAndRecipientUsernameAndStatus(
        requesterUsername: String,
        recipientUsername: String,
        status: FriendRequestStatus
    ): FriendRequest?

    fun findAllByRecipientUsernameAndStatus(username: String, pending: FriendRequestStatus): List<FriendRequest>
    fun findAllByRequesterUsernameAndStatus(username: String, pending: FriendRequestStatus): List<FriendRequest>
}
