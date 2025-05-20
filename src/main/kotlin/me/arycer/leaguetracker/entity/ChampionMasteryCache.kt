package me.arycer.leaguetracker.entity

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Lob
import jakarta.persistence.Table

@Entity
@Table(name = "champion_mastery_cache")
data class ChampionMasteryCache(
    @Id
    val puuid: String = "",

    @Lob
    val masteryJson: String = "",

    val lastUpdated: Long = 0L
)
