package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "timeline_cache")
data class TimelineEntity(
    @Id
    val matchId: String,

    @Lob
    @Column(nullable = false)
    val timelineJson: String,

    @Column(nullable = false)
    val cachedAt: Instant = Instant.now()
) {
    constructor() : this("", "", Instant.now())
}
