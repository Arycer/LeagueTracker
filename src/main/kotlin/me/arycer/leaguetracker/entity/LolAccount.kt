package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import me.arycer.leaguetracker.dto.misc.Region

@Entity
data class LolAccount(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: String? = null,

    var summonerName: String = "",
    var tagline: String = "",
    var summonerId: String = "",
    var profileIconId: Int = 0,

    @Enumerated(EnumType.STRING)
    var region: Region = Region.EUW,

    var verified: Boolean = false,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: User? = null
) {
    constructor() : this(null)
}
