package me.arycer.leaguetracker.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "users")
data class User(
    @Id
    val id: String = "",

    @Column(unique = true, nullable = false)
    var username: String = ""
)
