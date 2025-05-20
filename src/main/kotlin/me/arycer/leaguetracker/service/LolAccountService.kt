package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.dto.misc.MainLolAccountDto
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
        val currentProfileIconId = riotService.getCurrentProfileIconId(name, tagline, region)

        if (accountRepo.existsByUserIdAndSummonerId(userId, summonerId) ||
            pendingAccountRepo.existsByUserIdAndSummonerId(userId, summonerId)
        ) {
            throw IllegalArgumentException("Ya has vinculado esta cuenta o está pendiente de verificación.")
        }

        var icon: Int
        do {
            icon = riotService.pickRandomDefaultIcon()
        } while (icon == currentProfileIconId)

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
            val isFirstAccount = accountRepo.findAllByUserId(userId).isEmpty()
            val verifiedAccount = LolAccount(
                summonerName = pending.summonerName,
                tagline = pending.tagline,
                summonerId = pending.summonerId,
                profileIconId = pending.profileIconId,
                region = pending.region,
                isMain = isFirstAccount,
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
        val accounts = accountRepo.findAllByUserId(userId)
        val now = System.currentTimeMillis()

        return accounts.map { account ->
            if (account.verified) {
                val lastUpdate = account.lastIconUpdate ?: 0
                val cooldownMillis = 5 * 60 * 1000L

                if (now - lastUpdate >= cooldownMillis) {
                    val currentIcon = riotService.getCurrentProfileIconId(
                        account.summonerName,
                        account.tagline,
                        account.region
                    )
                    if (account.profileIconId != currentIcon) {
                        account.profileIconId = currentIcon
                    }
                    account.lastIconUpdate = now
                    accountRepo.save(account)
                }
            }

            account
        }
    }

    fun getPendingAccounts(userId: String): List<PendingLolAccount> {
        return pendingAccountRepo.findAllByUserId(userId)
    }

    fun deletePendingAccount(userId: String, accountId: String) {
        val account = pendingAccountRepo.findById(accountId)
            .filter { it.user?.id == userId }
            .orElseThrow { IllegalAccessException("Not authorized or pending account not found") }

        pendingAccountRepo.delete(account)
    }

    fun unlinkAccount(userId: String, accountId: String) {
        val account = accountRepo.findById(accountId)
            .filter { it.user?.id == userId }
            .orElseThrow()

        val wasMain = account.isMain
        accountRepo.delete(account)

        if (wasMain) {
            val remaining = accountRepo.findAllByUserId(userId)
            if (remaining.isNotEmpty()) {
                val first = remaining.first()
                first.isMain = true
                accountRepo.save(first)
            }
        }
    }

    fun setMainAccount(userId: String, accountId: String) {
        val account = accountRepo.findById(accountId)
            .filter { it.user?.id == userId }
            .orElseThrow()

        if (!account.verified) {
            throw IllegalStateException("Solo se pueden establecer como principal cuentas verificadas.")
        }

        // Desmarcar todas las demás cuentas del usuario
        val allAccounts = accountRepo.findAllByUserId(userId)
        allAccounts.forEach {
            if (it.isMain) {
                it.isMain = false
                accountRepo.save(it)
            }
        }

        // Marcar la nueva como principal
        account.isMain = true
        accountRepo.save(account)
    }

    fun getMainAccount(userId: String): LolAccount? {
        return accountRepo.findAllByUserId(userId).firstOrNull { it.isMain }
    }

    fun getMainAccountOfUser(userId: String): MainLolAccountDto? {
        return getMainAccount(userId)?.let {
            MainLolAccountDto(
                summonerName = it.summonerName,
                tagline = it.tagline,
                region = it.region,
                profileIconId = it.profileIconId
            )
        }
    }


}
