package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.ChatMessage
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ChatMessageRepository : JpaRepository<ChatMessage, Long> {
    fun findBySenderIdAndRecipientIdOrRecipientIdAndSenderIdOrderByTimestampAsc(
        senderId1: String, recipientId1: String,
        senderId2: String, recipientId2: String
    ): List<ChatMessage>

    @Query(
        """
        SELECT m FROM ChatMessage m
        WHERE (m.senderId = :user1 AND m.recipientId = :user2)
           OR (m.senderId = :user2 AND m.recipientId = :user1)
        ORDER BY m.timestamp DESC
    """
    )
    fun findConversationPaged(
        user1: String,
        user2: String,
        pageable: Pageable
    ): Page<ChatMessage>
}
