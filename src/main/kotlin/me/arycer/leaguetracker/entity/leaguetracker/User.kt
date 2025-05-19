// User.kt
package me.arycer.leaguetracker.repository

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "users")
data class User(
    @Id
    val id: String,        // id de Clerk
    val username: String?  // opcional, para mostrar nombre
)
