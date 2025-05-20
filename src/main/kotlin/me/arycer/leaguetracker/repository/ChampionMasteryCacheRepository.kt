package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.ChampionMasteryCache
import org.springframework.data.jpa.repository.JpaRepository

interface ChampionMasteryCacheRepository : JpaRepository<ChampionMasteryCache, String> {
    fun findByPuuid(puuid: String): ChampionMasteryCache?
}
