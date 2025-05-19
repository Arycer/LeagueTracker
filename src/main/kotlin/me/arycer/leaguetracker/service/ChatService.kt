package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.entity.ChatMessage
import me.arycer.leaguetracker.repository.ChatMessageRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class ChatService(private val chatMessageRepository: ChatMessageRepository) {

    @Transactional
    fun saveMessage(senderId: String, recipientId: String, content: String): ChatMessage {
        val message = ChatMessage(
            senderId = senderId,
            recipientId = recipientId,
            content = content,
            timestamp = Instant.now()
        )
        return chatMessageRepository.save(message)
    }

    fun getMessagesBetweenUsers(user1: String, user2: String): List<ChatMessage> {
        return chatMessageRepository.findBySenderIdAndRecipientIdOrRecipientIdAndSenderIdOrderByTimestampAsc(
            user1, user2,
            user1, user2
        )
    }
}
