package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.entity.leaguetracker.Friendship
import me.arycer.leaguetracker.entity.leaguetracker.FriendshipId
import me.arycer.leaguetracker.repository.FriendshipRepository
import me.arycer.leaguetracker.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class FriendshipService(
    private val friendshipRepository: FriendshipRepository,
    private val userRepository: UserRepository
) {

    fun getFriends(userId: String): List<String> {
        return friendshipRepository.findByUserId(userId)
            .map { it.friendId }
    }

    fun addFriend(userId: String, friendId: String): Boolean {
        // Validar que ambos usuarios existan
        if (!userRepository.existsById(userId) || !userRepository.existsById(friendId)) {
            return false
        }
        // Validar que la amistad no exista aún
        if (friendshipRepository.existsByUserIdAndFriendId(userId, friendId)) {
            return false
        }
        // Crear amistad bidireccional
        friendshipRepository.save(Friendship(userId, friendId))
        friendshipRepository.save(Friendship(friendId, userId))
        return true
    }

    fun removeFriend(userId: String, friendId: String): Boolean {
        val friendshipId1 = FriendshipId(userId, friendId)
        val friendshipId2 = FriendshipId(friendId, userId)

        if (!friendshipRepository.existsById(friendshipId1)) return false

        friendshipRepository.deleteById(friendshipId1)
        friendshipRepository.deleteById(friendshipId2)
        return true
    }
}
