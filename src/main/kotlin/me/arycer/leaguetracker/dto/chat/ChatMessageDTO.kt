package me.arycer.leaguetracker.dto.chat

data class ChatMessageDTO(
    val senderUsername: String,
    val recipientUsername: String,
    val content: String,
    val timestamp: Long? = null
)
