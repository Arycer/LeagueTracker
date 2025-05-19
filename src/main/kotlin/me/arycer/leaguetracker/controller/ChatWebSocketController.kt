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
        // Guardar el mensaje en base de datos
        val savedMessage = chatService.saveMessage(
            chatMessageDTO.senderId,
            chatMessageDTO.recipientId,
            chatMessageDTO.content
        )

        // Enviar mensaje al destinatario suscrito a /queue/messages-{recipientId}
        messagingTemplate.convertAndSend(
            "/queue/messages-${savedMessage.recipientId}",
            ChatMessageDTO(
                senderId = savedMessage.senderId,
                recipientId = savedMessage.recipientId,
                content = savedMessage.content,
                timestamp = savedMessage.timestamp.toEpochMilli()
            )
        )
    }
}
