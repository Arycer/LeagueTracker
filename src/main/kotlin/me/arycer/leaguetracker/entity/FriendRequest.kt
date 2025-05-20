package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import java.io.Serializable
import java.time.Instant

@Entity
@Table(name = "friend_requests")
@IdClass(FriendRequestId::class)
class FriendRequest() {  // Constructor vacío para JPA

    @Id
    @Column(name = "requester_username")
    lateinit var requesterUsername: String

    @Id
    @Column(name = "recipient_username")
    lateinit var recipientUsername: String

    @Enumerated(EnumType.STRING)
    var status: FriendRequestStatus = FriendRequestStatus.PENDING

    var createdAt: Instant = Instant.now()

    constructor(
        requesterUsername: String,
        recipientUsername: String,
        status: FriendRequestStatus = FriendRequestStatus.PENDING,
        createdAt: Instant = Instant.now()
    ) : this() {
        this.requesterUsername = requesterUsername
        this.recipientUsername = recipientUsername
        this.status = status
        this.createdAt = createdAt
    }
}

enum class FriendRequestStatus {
    PENDING,
    ACCEPTED,
    REJECTED
}

// Id compuesto actualizado
data class FriendRequestId(
    val requesterUsername: String = "",
    val recipientUsername: String = ""
) : Serializable
