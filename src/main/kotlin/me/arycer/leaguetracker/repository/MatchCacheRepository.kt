package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.MatchCache
import org.springframework.data.jpa.repository.JpaRepository

interface MatchCacheRepository : JpaRepository<MatchCache, String> {
    fun findByMatchId(matchId: String): MatchCache?
}
