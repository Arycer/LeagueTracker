package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import java.io.Serializable
import java.time.Instant

@Entity
@Table(name = "friend_requests")
@IdClass(FriendRequestId::class)
class FriendRequest() {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", referencedColumnName = "id")
    lateinit var requester: User

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", referencedColumnName = "id")
    lateinit var recipient: User

    @Enumerated(EnumType.STRING)
    var status: FriendRequestStatus = FriendRequestStatus.PENDING

    var createdAt: Instant = Instant.now()

    constructor(
        requester: User,
        recipient: User,
        status: FriendRequestStatus = FriendRequestStatus.PENDING,
        createdAt: Instant = Instant.now()
    ) : this() {
        this.requester = requester
        this.recipient = recipient
        this.status = status
        this.createdAt = createdAt
    }
}

enum class FriendRequestStatus {
    PENDING,
    ACCEPTED,
    REJECTED
}

data class FriendRequestId(
    val requester: String = "",
    val recipient: String = ""
) : Serializable


data class FriendRequestDto(
    val requesterUsername: String,
    val recipientUsername: String,
    val status: FriendRequestStatus,
    val createdAt: Instant
) {
    companion object {
        fun fromEntity(friendRequest: FriendRequest): FriendRequestDto {
            return FriendRequestDto(
                requesterUsername = friendRequest.requester.username,
                recipientUsername = friendRequest.recipient.username,
                status = friendRequest.status,
                createdAt = friendRequest.createdAt
            )
        }
    }
}