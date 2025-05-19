package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "chat_messages")
data class ChatMessage(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "sender_id", nullable = false)
    var senderId: String = "",

    @Column(name = "recipient_id", nullable = false)
    var recipientId: String = "",

    @Column(nullable = false)
    var content: String = "",

    @Column(nullable = false)
    var timestamp: Instant = Instant.now()
) {
    // Constructor vacío para JPA
    constructor() : this(null, "", "", "", Instant.now())
}
