package me.arycer.leaguetracker.listener

import me.arycer.leaguetracker.service.ClerkJwtService
import me.arycer.leaguetracker.service.PresenceService
import org.springframework.context.event.EventListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.stereotype.Component
import org.springframework.web.socket.messaging.SessionConnectEvent
import org.springframework.web.socket.messaging.SessionDisconnectEvent
import java.util.concurrent.ConcurrentHashMap

@Component
class WebSocketPresenceListener(
    private val presenceService: PresenceService,
    private val jwtService: ClerkJwtService,
    private val messagingTemplate: SimpMessagingTemplate
) {
    private val sessionIdToUsername = ConcurrentHashMap<String, String>()

    @EventListener
    fun handleWebSocketConnectListener(event: SessionConnectEvent) {
        val accessor = StompHeaderAccessor.wrap(event.message)
        val authHeader = accessor.getFirstNativeHeader("Authorization") ?: return
        val token = authHeader.substringAfter("Bearer ").trim()

        val tokenInfo = jwtService.validateToken(token) ?: return
        val username = tokenInfo.username
        val sessionId = accessor.sessionId ?: return

        sessionIdToUsername[sessionId] = username
        presenceService.markOnline(username)

        messagingTemplate.convertAndSend(
            "/topic/presence-updates",
            mapOf("event" to "connected", "username" to username)
        )
    }

    @EventListener
    fun handleWebSocketDisconnectListener(event: SessionDisconnectEvent) {
        val accessor = StompHeaderAccessor.wrap(event.message)
        val sessionId = accessor.sessionId
        val username = sessionIdToUsername.remove(sessionId)

        if (username != null) {
            presenceService.markOffline(username)
            messagingTemplate.convertAndSend(
                "/topic/presence-updates",
                mapOf("event" to "disconnected", "username" to username)
            )
        }
    }
}
