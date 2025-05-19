package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.leaguetracker.Message
import org.springframework.data.jpa.repository.JpaRepository

interface MessageRepository : JpaRepository<Message, Long> {
    fun findBySenderIdAndReceiverId(senderId: String, receiverId: String): List<Message>
    fun findByReceiverId(receiverId: String): List<Message>
}
