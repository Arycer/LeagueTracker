package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.FavoriteProfile
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface FavoriteProfileRepository : JpaRepository<FavoriteProfile, UUID> {
    fun findAllByUserId(userId: String): List<FavoriteProfile>
}
