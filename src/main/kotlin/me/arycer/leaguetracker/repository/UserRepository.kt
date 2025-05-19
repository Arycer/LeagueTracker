package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, String> {
    fun existsUserByUsername(username: String): Boolean
}
