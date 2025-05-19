package me.arycer.leaguetracker.config

import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        // Endpoint para que el cliente se conecte (ej: ws://localhost:8080/ws)
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*") // Ajusta CORS según sea necesario
            .withSockJS() // soporte para fallback SockJS
    }

    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        config.enableSimpleBroker("/topic", "/queue") // Broker para enviar mensajes
        config.setApplicationDestinationPrefixes("/app") // Prefijo para mensajes del cliente al servidor
    }
}