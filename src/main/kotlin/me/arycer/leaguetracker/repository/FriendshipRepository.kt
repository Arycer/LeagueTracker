package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.leaguetracker.Friendship
import me.arycer.leaguetracker.entity.leaguetracker.FriendshipId
import org.springframework.data.jpa.repository.JpaRepository

interface FriendshipRepository : JpaRepository<Friendship, FriendshipId> {
    fun findByUserId(userId: String): List<Friendship>
    fun existsByUserIdAndFriendId(userId: String, friendId: String): Boolean
}
