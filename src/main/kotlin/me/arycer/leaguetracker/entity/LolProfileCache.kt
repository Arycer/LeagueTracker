package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import me.arycer.leaguetracker.dto.misc.Region

@Entity
@Table(name = "lol_profile_cache")
data class LolProfileCache(
    @Id
    val key: String,

    val summonerName: String,
    val summonerLevel: Long,
    val profileIconId: Int,

    @Lob
    val leagueEntriesJson: String,

    @Enumerated(EnumType.STRING)
    val region: Region,

    val lastUpdated: Long
) {
    // Constructor vacío necesario para Hibernate
    constructor() : this(
        "", "", 0, 0, "", Region.EUW, 0L
    )
}
