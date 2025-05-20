package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.FriendRequest
import me.arycer.leaguetracker.entity.FriendRequestId
import me.arycer.leaguetracker.entity.FriendRequestStatus
import me.arycer.leaguetracker.entity.User
import org.springframework.data.jpa.repository.JpaRepository

interface FriendRequestRepository : JpaRepository<FriendRequest, FriendRequestId> {
    fun findByRecipientAndStatus(recipient: User, status: FriendRequestStatus): List<FriendRequest>
    fun findByRequesterAndStatus(requester: User, status: FriendRequestStatus): List<FriendRequest>
    fun existsByRequesterAndRecipientAndStatus(
        requester: User,
        recipient: User,
        status: FriendRequestStatus
    ): Boolean

    fun findByRequesterAndRecipientAndStatus(
        requester: User,
        recipient: User,
        status: FriendRequestStatus
    ): FriendRequest?

    fun findAllByRequesterAndStatus(requester: User, status: FriendRequestStatus): List<FriendRequest>
    fun findAllByRecipientAndStatus(recipient: User, status: FriendRequestStatus): List<FriendRequest>
}
