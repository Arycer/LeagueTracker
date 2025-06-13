package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.chat.ChatMessageDTO
import me.arycer.leaguetracker.service.ChatService
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller

@Controller
class ChatWebSocketController(
    private val chatService: ChatService,
    private val messagingTemplate: SimpMessagingTemplate
) {

    @MessageMapping("/chat.sendMessage")
    fun sendMessage(@Payload chatMessageDTO: ChatMessageDTO) {
        println("Received message: $chatMessageDTO")

        val savedMessage = chatService.saveMessage(
            chatMessageDTO.senderUsername,
            chatMessageDTO.recipientUsername,
            chatMessageDTO.content
        )

        println("Sending to /queue/messages-${savedMessage.recipient.username}")

        messagingTemplate.convertAndSend(
            "/queue/messages-${savedMessage.recipient.username}",
            ChatMessageDTO(
                senderUsername = savedMessage.sender.username,
                recipientUsername = savedMessage.sender.username,
                content = savedMessage.content,
                timestamp = savedMessage.timestamp.toEpochMilli()
            )
        )
    }
}
