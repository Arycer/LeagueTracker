package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.LolProfileCache
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LolProfileCacheRepository : JpaRepository<LolProfileCache, String> {
    fun findByKey(key: String): LolProfileCache?
}
