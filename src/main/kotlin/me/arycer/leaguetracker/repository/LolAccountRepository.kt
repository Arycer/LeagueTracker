package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.LolAccount
import org.springframework.data.jpa.repository.JpaRepository

interface LolAccountRepository : JpaRepository<LolAccount, String> {
    fun findAllByUserId(userId: String): List<LolAccount>
    fun existsByUserIdAndSummonerId(userId: String, summonerId: String): Boolean
}
