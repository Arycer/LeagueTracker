package me.arycer.leaguetracker.service

import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap

@Service
class PresenceService {

    private val onlineUsers: MutableSet<String> = ConcurrentHashMap.newKeySet()

    fun markOnline(username: String) {
        onlineUsers.add(username)
        println("User connected: $username")
    }

    fun markOffline(username: String) {
        onlineUsers.remove(username)
        println("User disconnected: $username")
    }

    fun isOnline(username: String): Boolean = username in onlineUsers

    fun getOnlineUsers(): Set<String> = onlineUsers
}
