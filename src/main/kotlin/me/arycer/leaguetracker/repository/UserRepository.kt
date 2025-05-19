package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.leaguetracker.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, String> {
}
