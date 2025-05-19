package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import java.io.Serializable
import java.time.Instant

@Entity
@Table(name = "friend_requests")
@IdClass(FriendRequestId::class)
class FriendRequest() {  // constructor vacío para JPA

    @Id
    @Column(name = "requester_id")
    lateinit var requesterId: String

    @Id
    @Column(name = "recipient_id")
    lateinit var recipientId: String

    @Enumerated(EnumType.STRING)
    var status: FriendRequestStatus = FriendRequestStatus.PENDING

    var createdAt: Instant = Instant.now()

    // Constructor secundario para inicialización fácil
    constructor(
        requesterId: String,
        recipientId: String,
        status: FriendRequestStatus = FriendRequestStatus.PENDING,
        createdAt: Instant = Instant.now()
    ) : this() {
        this.requesterId = requesterId
        this.recipientId = recipientId
        this.status = status
        this.createdAt = createdAt
    }
}

enum class FriendRequestStatus {
    PENDING,
    ACCEPTED,
    REJECTED
}

// Id compuesto para FriendRequest
data class FriendRequestId(
    val requesterId: String = "",
    val recipientId: String = ""
) : Serializable
