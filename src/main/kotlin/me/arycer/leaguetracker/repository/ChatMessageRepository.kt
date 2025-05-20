package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.ChatMessage
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ChatMessageRepository : JpaRepository<ChatMessage, Long> {
    @Query(
        """
        SELECT m FROM ChatMessage m
        WHERE (m.sender.username = :user1 AND m.recipient.username = :user2)
           OR (m.sender.username = :user2 AND m.recipient.username = :user1)
        ORDER BY m.timestamp DESC
    """
    )
    fun findConversationPaged(
        user1: String,
        user2: String,
        pageable: Pageable
    ): Page<ChatMessage>

    fun findBySenderUsernameAndRecipientUsernameOrRecipientUsernameAndSenderUsernameOrderByTimestampAsc(
        senderId1: String,
        recipientId1: String,
        senderId2: String,
        recipientId2: String
    ): List<ChatMessage>
}
