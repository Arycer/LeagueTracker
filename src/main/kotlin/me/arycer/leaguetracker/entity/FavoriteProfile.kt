package me.arycer.leaguetracker.entity

import jakarta.persistence.*
import java.util.*

@Entity
@Table(name = "favorite_profiles")
data class FavoriteProfile(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false)
    val userId: String, // ID del usuario propietario (auth)

    @Column(nullable = false)
    val region: String,

    @Column(nullable = false)
    val summonerName: String,

    @Column(nullable = false)
    val tagline: String
) {
    // Constructor vacío necesario para Hibernate
    constructor() : this(
        null, "", "", "", ""
    )
}
