// Message.kt
package me.arycer.leaguetracker.entity.leaguetracker

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "messages")
data class Message(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val senderId: String,
    val receiverId: String,
    val content: String,
    val timestamp: Instant = Instant.now()
)
