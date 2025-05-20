package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.entity.ChatMessage
import me.arycer.leaguetracker.repository.ChatMessageRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class ChatService(
    private val chatMessageRepository: ChatMessageRepository,
    private val userService: UserService,
) {

    @Transactional
    fun saveMessage(senderId: String, recipientId: String, content: String): ChatMessage {
        val sender = userService.getUserByUsername(senderId)
            ?: throw IllegalArgumentException("Sender not found")

        val recipient = userService.getUserByUsername(recipientId)
            ?: throw IllegalArgumentException("Recipient not found")

        val message = ChatMessage(
            sender = sender,
            recipient = recipient,
            content = content,
            timestamp = Instant.now()
        )

        return chatMessageRepository.save(message)
    }

    fun getMessagesBetweenUsers(user1: String, user2: String): List<ChatMessage> {
        return chatMessageRepository.findBySenderUsernameAndRecipientUsernameOrRecipientUsernameAndSenderUsernameOrderByTimestampAsc(
            user1, user2,
            user1, user2
        )
    }
}
