package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.entity.FriendRequest
import me.arycer.leaguetracker.entity.FriendRequestId
import me.arycer.leaguetracker.entity.FriendRequestStatus
import me.arycer.leaguetracker.repository.FriendRequestRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FriendRequestService(private val friendRequestRepository: FriendRequestRepository) {

    fun sendRequest(requesterId: String, recipientId: String): FriendRequest {
        if (requesterId == recipientId) throw IllegalArgumentException("No te puedes enviar una solicitud a ti mismo")

        if (friendRequestRepository.existsByRequesterIdAndRecipientIdAndStatus(requesterId, recipientId, FriendRequestStatus.PENDING)) {
            throw IllegalStateException("Ya has enviado una solicitud pendiente a este usuario")
        }

        val request = FriendRequest(
            requesterId = requesterId,
            recipientId = recipientId,
            status = FriendRequestStatus.PENDING
        )
        return friendRequestRepository.save(request)
    }

    fun getIncomingRequests(userId: String): List<FriendRequest> {
        return friendRequestRepository.findByRecipientIdAndStatus(userId, FriendRequestStatus.PENDING)
    }

    fun getOutgoingRequests(userId: String): List<FriendRequest> {
        return friendRequestRepository.findByRequesterIdAndStatus(userId, FriendRequestStatus.PENDING)
    }

    @Transactional
    fun respondRequest(requesterId: String, recipientId: String, accept: Boolean): FriendRequest {
        val request = friendRequestRepository.findByIdOrNull(FriendRequestId(requesterId, recipientId))
            ?: throw IllegalArgumentException("Solicitud no encontrada")

        if (request.status != FriendRequestStatus.PENDING) {
            throw IllegalStateException("Esta solicitud ya fue respondida")
        }

        request.status = if (accept) FriendRequestStatus.ACCEPTED else FriendRequestStatus.REJECTED
        return friendRequestRepository.save(request)
    }

    fun getFriends(userId: String): List<String> {
        val acceptedRequests =
            friendRequestRepository.findByRequesterIdAndStatus(userId, FriendRequestStatus.ACCEPTED) +
                    friendRequestRepository.findByRecipientIdAndStatus(userId, FriendRequestStatus.ACCEPTED)

        val friends = acceptedRequests.map {
            if (it.requesterId == userId) it.recipientId else it.requesterId
        }
        return friends
    }

    fun removeFriend(userId: String, friendId: String) {
        // Buscar la solicitud aceptada en cualquier dirección
        val friendship = friendRequestRepository.findByRequesterIdAndRecipientIdAndStatus(
            userId,
            friendId,
            FriendRequestStatus.ACCEPTED
        )
            ?: friendRequestRepository.findByRequesterIdAndRecipientIdAndStatus(
                friendId,
                userId,
                FriendRequestStatus.ACCEPTED
            )
            ?: throw IllegalArgumentException("No friendship found between $userId and $friendId")

        friendRequestRepository.delete(friendship)
    }


}
