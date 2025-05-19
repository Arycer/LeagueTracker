package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.client.RiotApiClient
import me.arycer.leaguetracker.dto.ddragon.VersionsDTO
import org.springframework.stereotype.Service

@Service
class LTVersionService(private val riotApiClient: RiotApiClient) {
    val versions: VersionsDTO
        get() = riotApiClient.fetchVersions()
}
