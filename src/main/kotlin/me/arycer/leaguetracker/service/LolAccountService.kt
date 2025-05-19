package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.entity.LolAccount
import me.arycer.leaguetracker.entity.PendingLolAccount
import me.arycer.leaguetracker.repository.LolAccountRepository
import me.arycer.leaguetracker.repository.PendingLolAccountRepository
import me.arycer.leaguetracker.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class LolAccountService(
    private val riotService: RiotService,
    private val accountRepo: LolAccountRepository,
    private val pendingAccountRepo: PendingLolAccountRepository,
    private val userRepo: UserRepository
) {
    fun linkAccount(userId: String, name: String, tagline: String, region: Region): Int {
        val summonerId = riotService.getSummonerId(name, tagline, region)
        val icon = riotService.pickRandomDefaultIcon()

        val user = userRepo.findById(userId).orElseThrow()
        val pending = PendingLolAccount(
            summonerName = name,
            tagline = tagline,
            summonerId = summonerId,
            profileIconId = icon,
            region = region,
            user = user
        )

        pendingAccountRepo.save(pending)
        return icon
    }

    fun verifyPendingAccount(userId: String): Boolean {
        val pending = pendingAccountRepo.findFirstByUserId(userId)
            ?: throw NoSuchElementException("No pending LoL account for verification.")

        val currentIcon = riotService.getCurrentProfileIconId(pending.summonerName, pending.tagline, pending.region)
        print("Current icon: $currentIcon")
        print("Pending icon: ${pending.profileIconId}")

        if (currentIcon == pending.profileIconId) {
            val verifiedAccount = LolAccount(
                summonerName = pending.summonerName,
                tagline = pending.tagline,
                summonerId = pending.summonerId,
                profileIconId = pending.profileIconId,
                region = pending.region,
                verified = true,
                user = pending.user
            )
            accountRepo.save(verifiedAccount)
            pendingAccountRepo.delete(pending)
            return true
        }

        return false
    }

    fun getAccounts(userId: String): List<LolAccount> {
        return accountRepo.findAllByUserId(userId)
    }
}
