package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import me.arycer.leaguetracker.dto.misc.Region

@Entity
@Table(name = "match_cache")
data class MatchCache(

    @Id
    var matchId: String = "",

    @Lob
    @Column(nullable = false)
    var matchJson: String = "",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var region: Region = Region.EUW
)
