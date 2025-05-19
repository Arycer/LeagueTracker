package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.PendingLolAccount
import org.springframework.data.jpa.repository.JpaRepository

interface PendingLolAccountRepository : JpaRepository<PendingLolAccount, String> {
    fun findFirstByUserId(userId: String): PendingLolAccount?
    fun findAllByUserId(userId: String): List<PendingLolAccount>
    fun existsByUserIdAndSummonerId(userId: String, summonerId: String): Boolean
}
