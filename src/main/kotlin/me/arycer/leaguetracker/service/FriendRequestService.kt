package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.entity.FriendRequest
import me.arycer.leaguetracker.entity.FriendRequestId
import me.arycer.leaguetracker.entity.FriendRequestStatus
import me.arycer.leaguetracker.repository.FriendRequestRepository
import me.arycer.leaguetracker.repository.UserRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FriendRequestService(
    private val friendRequestRepository: FriendRequestRepository,
    private val userRepository: UserRepository
) {

    fun sendRequest(requesterUsername: String, recipientUsername: String): FriendRequest {
        if (requesterUsername == recipientUsername) throw IllegalArgumentException("No te puedes enviar una solicitud a ti mismo")

        val requester = userRepository.findByUsername(requesterUsername)
            ?: throw IllegalArgumentException("Usuario solicitante no encontrado")

        val recipient = userRepository.findByUsername(recipientUsername)
            ?: throw IllegalArgumentException("Usuario destinatario no encontrado")

        if (friendRequestRepository.existsByRequesterUsernameAndRecipientUsernameAndStatus(
                requester.username,
                recipient.username,
                FriendRequestStatus.PENDING
            )
        ) {
            throw IllegalStateException("Ya has enviado una solicitud pendiente a este usuario")
        }

        val request = FriendRequest(
            requesterUsername = requesterUsername,
            recipientUsername = recipientUsername,
            status = FriendRequestStatus.PENDING
        )
        return friendRequestRepository.save(request)
    }

    fun getIncomingRequests(username: String): List<FriendRequest> {
        return friendRequestRepository.findAllByRecipientUsernameAndStatus(username, FriendRequestStatus.PENDING)
    }

    fun getOutgoingRequests(username: String): List<FriendRequest> {
        return friendRequestRepository.findAllByRequesterUsernameAndStatus(username, FriendRequestStatus.PENDING)
    }

    @Transactional
    fun respondRequest(requesterUsername: String, recipientUsername: String, accept: Boolean): FriendRequest {
        val requester = userRepository.findByUsername(requesterUsername)
            ?: throw IllegalArgumentException("Usuario solicitante no encontrado")
        val recipient = userRepository.findByUsername(recipientUsername)
            ?: throw IllegalArgumentException("Usuario destinatario no encontrado")

        val request = friendRequestRepository.findByIdOrNull(FriendRequestId(requester.username, recipient.username))
            ?: throw IllegalArgumentException("Solicitud no encontrada")

        if (request.status != FriendRequestStatus.PENDING) {
            throw IllegalStateException("Esta solicitud ya fue respondida")
        }

        request.status = if (accept) FriendRequestStatus.ACCEPTED else FriendRequestStatus.REJECTED
        if (accept) {
            return friendRequestRepository.save(request)
        } else {
            friendRequestRepository.delete(request)
            return request
        }
    }

    fun getFriends(username: String): List<String> {
        val user = userRepository.findByUsername(username) ?: throw IllegalArgumentException("Usuario no encontrado")

        val acceptedRequests = friendRequestRepository.findByRequesterUsernameAndStatus(
            user.username,
            FriendRequestStatus.ACCEPTED
        ) + friendRequestRepository.findByRecipientUsernameAndStatus(user.username, FriendRequestStatus.ACCEPTED)

        val friendUsernames = acceptedRequests.map { request ->
            if (request.requesterUsername == user.username) {
                request.recipientUsername
            } else {
                request.requesterUsername
            }
        }

        return userRepository.findAllByUsernameIn(friendUsernames)
            .map { it.username }
            .distinct()
    }

    fun removeFriend(username: String, friendUsername: String) {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("Usuario no encontrado")
        val friend = userRepository.findByUsername(friendUsername)
            ?: throw IllegalArgumentException("Amigo no encontrado")

        val friendship = friendRequestRepository.findByRequesterUsernameAndRecipientUsernameAndStatus(
            user.username,
            friend.username,
            FriendRequestStatus.ACCEPTED
        )
            ?: friendRequestRepository.findByRequesterUsernameAndRecipientUsernameAndStatus(
                friend.username,
                user.username,
                FriendRequestStatus.ACCEPTED
            )
            ?: throw IllegalArgumentException("No friendship found between $username and $friendUsername")

        friendRequestRepository.delete(friendship)
    }

}
