package me.arycer.leaguetracker.dto.chat

data class ChatMessageDTO(
    val senderId: String,
    val recipientId: String,
    val content: String,
    val timestamp: Long? = null
)
