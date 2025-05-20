package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.chat.ChatMessageDTO
import me.arycer.leaguetracker.entity.ChatMessage
import me.arycer.leaguetracker.repository.ChatMessageRepository
import me.arycer.leaguetracker.service.UserService
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/chat")
class ChatHistoryController(
    private val chatMessageRepository: ChatMessageRepository,
    private val userService: UserService
) {
    @GetMapping("/history/{otherUsername}")
    fun getChatHistory(
        principal: Principal,
        @PathVariable otherUsername: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<List<ChatMessageDTO>> {
        val userId = principal.name
        val username = userService.getUsernameById(userId)
            ?: return ResponseEntity.badRequest().body(emptyList())
        if (!userService.existsByUsername(otherUsername)) {
            return ResponseEntity.badRequest().body(emptyList())
        }

        val pageable = PageRequest.of(page, size)
        val findConversationPaged = chatMessageRepository.findConversationPaged(username, otherUsername, pageable)

        val messages = findConversationPaged.content.map { message ->
            ChatMessageDTO(
                senderUsername = message.sender.username,
                recipientUsername = message.recipient.username,
                content = message.content,
                timestamp = message.timestamp.toEpochMilli()
            )
        }

        val ordered = messages.sortedBy { it.timestamp }
        return ResponseEntity.ok(ordered)
    }
}
