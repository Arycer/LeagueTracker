package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "chat_messages")
data class ChatMessage(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", referencedColumnName = "id", nullable = false)
    var sender: User = User(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", referencedColumnName = "id", nullable = false)
    var recipient: User = User(),

    @Column(nullable = false)
    var content: String = "",

    @Column(nullable = false)
    var timestamp: Instant = Instant.now()
) {
    constructor() : this(null, User(), User(), "", Instant.now())
}
