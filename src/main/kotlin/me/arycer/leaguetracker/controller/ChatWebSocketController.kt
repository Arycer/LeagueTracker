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

    // Recibe mensajes desde el cliente en /app/chat.sendMessage
    @MessageMapping("/chat.sendMessage")
    fun sendMessage(@Payload chatMessageDTO: ChatMessageDTO) {
        println("Received message: $chatMessageDTO")

        // Guardar el mensaje en base de datos
        val savedMessage = chatService.saveMessage(
            chatMessageDTO.senderUsername,
            chatMessageDTO.recipientUsername,
            chatMessageDTO.content
        )

        println("Sending to /queue/messages-${savedMessage.recipientUsername}")

        // Enviar mensaje al destinatario suscrito a /queue/messages-{recipientId}
        messagingTemplate.convertAndSend(
            "/queue/messages-${savedMessage.recipientUsername}",
            ChatMessageDTO(
                senderUsername = savedMessage.senderUsername,
                recipientUsername = savedMessage.recipientUsername,
                content = savedMessage.content,
                timestamp = savedMessage.timestamp.toEpochMilli()
            )
        )
    }
}
