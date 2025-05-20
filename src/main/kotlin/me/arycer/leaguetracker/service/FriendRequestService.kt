package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.entity.FriendRequest
import me.arycer.leaguetracker.entity.FriendRequestDto
import me.arycer.leaguetracker.entity.FriendRequestStatus
import me.arycer.leaguetracker.repository.FriendRequestRepository
import me.arycer.leaguetracker.repository.UserRepository
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

        if (friendRequestRepository.existsByRequesterAndRecipientAndStatus(
                requester,
                recipient,
                FriendRequestStatus.PENDING
            )
        ) {
            throw IllegalStateException("Ya has enviado una solicitud pendiente a este usuario")
        }

        val request = FriendRequest(
            requester = requester,
            recipient = recipient,
            status = FriendRequestStatus.PENDING
        )
        return friendRequestRepository.save(request)
    }

    fun getIncomingRequests(username: String): List<FriendRequestDto> {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("Usuario no encontrado")

        val findAllByRecipientAndStatus =
            friendRequestRepository.findAllByRecipientAndStatus(user, FriendRequestStatus.PENDING)
        val incomingRequests = findAllByRecipientAndStatus.map { request ->
            FriendRequestDto(
                requesterUsername = request.requester.username,
                recipientUsername = request.recipient.username,
                status = request.status,
                createdAt = request.createdAt
            )
        }

        return incomingRequests
    }

    fun getOutgoingRequests(username: String): List<FriendRequestDto> {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("Usuario no encontrado")

        val findAllByRequesterAndStatus =
            friendRequestRepository.findAllByRequesterAndStatus(user, FriendRequestStatus.PENDING)
        val outgoingRequests = findAllByRequesterAndStatus.map { request ->
            FriendRequestDto(
                requesterUsername = request.requester.username,
                recipientUsername = request.recipient.username,
                status = request.status,
                createdAt = request.createdAt
            )
        }

        return outgoingRequests
    }

    @Transactional
    fun respondRequest(requesterUsername: String, recipientUsername: String, accept: Boolean): FriendRequest {
        println("Responder solicitud de amistad: $requesterUsername a $recipientUsername, aceptar: $accept")
        val requester = userRepository.findByUsername(requesterUsername)
            ?: throw IllegalArgumentException("Usuario solicitante no encontrado")
        val recipient = userRepository.findByUsername(recipientUsername)
            ?: throw IllegalArgumentException("Usuario destinatario no encontrado")

        val request = friendRequestRepository.findByRequesterAndRecipientAndStatus(
            requester,
            recipient,
            FriendRequestStatus.PENDING
        )
            ?: throw IllegalArgumentException("No se encontró la solicitud de amistad entre $requesterUsername y $recipientUsername")

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

        val acceptedRequests = friendRequestRepository.findByRequesterAndStatus(
            user,
            FriendRequestStatus.ACCEPTED
        ) + friendRequestRepository.findByRecipientAndStatus(user, FriendRequestStatus.ACCEPTED)

        val friendUsernames = acceptedRequests.map { request ->
            if (request.requester.username == user.username) {
                request.recipient.username
            } else {
                request.requester.username
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

        val friendship = friendRequestRepository.findByRequesterAndRecipientAndStatus(
            user,
            friend,
            FriendRequestStatus.ACCEPTED
        )
            ?: friendRequestRepository.findByRequesterAndRecipientAndStatus(
                friend,
                user,
                FriendRequestStatus.ACCEPTED
            )
            ?: throw IllegalArgumentException("No friendship found between $username and $friendUsername")

        friendRequestRepository.delete(friendship)
    }

    fun isFriends(username1: String, username2: String): Boolean {
        val user1 = userRepository.findByUsername(username1)
            ?: throw IllegalArgumentException("Usuario no encontrado")
        val user2 = userRepository.findByUsername(username2)
            ?: throw IllegalArgumentException("Amigo no encontrado")

        return friendRequestRepository.existsByRequesterAndRecipientAndStatus(
            user1,
            user2,
            FriendRequestStatus.ACCEPTED
        ) || friendRequestRepository.existsByRequesterAndRecipientAndStatus(
            user2,
            user1,
            FriendRequestStatus.ACCEPTED
        )
    }

    fun existingRequest(requester: String, recipientUsername: String): Boolean {
        val requesterUser = userRepository.findByUsername(requester)
            ?: throw IllegalArgumentException("Usuario solicitante no encontrado")
        val recipientUser = userRepository.findByUsername(recipientUsername)
            ?: throw IllegalArgumentException("Usuario destinatario no encontrado")

        return friendRequestRepository.existsByRequesterAndRecipientAndStatus(
            requesterUser,
            recipientUser,
            FriendRequestStatus.PENDING
        )
    }

}
