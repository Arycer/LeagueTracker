package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.entity.User
import me.arycer.leaguetracker.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class UserService(private val userRepository: UserRepository) {

    fun getUsernameById(id: String): String? {
        return userRepository.findById(id)
            .map { it.username }
            .orElse(null)
    }

    fun existsByUsername(username: String): Boolean {
        return userRepository.existsUserByUsername(username)
    }

    fun getUserByUsername(username: String): User? {
        return userRepository.findByUsername(username)
    }
}
