// Friendship.kt
package me.arycer.leaguetracker.entity.leaguetracker

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.IdClass
import jakarta.persistence.Table
import java.io.Serializable

@Entity
@IdClass(FriendshipId::class)
@Table(name = "friendships")
data class Friendship(
    @Id
    val userId: String,

    @Id
    val friendId: String
)

// Clave compuesta
data class FriendshipId(
    val userId: String = "",
    val friendId: String = ""
) : Serializable
