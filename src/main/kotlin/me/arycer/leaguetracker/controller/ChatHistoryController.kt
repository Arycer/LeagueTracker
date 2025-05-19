package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.entity.ChatMessage
import me.arycer.leaguetracker.repository.ChatMessageRepository
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/chat")
class ChatHistoryController(private val chatMessageRepository: ChatMessageRepository) {
    @GetMapping("/history/{otherUserId}")
    fun getChatHistory(
        principal: Principal,
        @PathVariable otherUserId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<List<ChatMessage>> {
        val userId = principal.name
        val pageable = PageRequest.of(page, size)
        val messages = chatMessageRepository.findConversationPaged(userId, otherUserId, pageable)

        val ordered = messages.content.sortedBy { it.timestamp }
        return ResponseEntity.ok(ordered)
    }
}
