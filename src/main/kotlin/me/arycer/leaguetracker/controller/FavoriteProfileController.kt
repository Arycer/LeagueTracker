package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.favorite.AddFavoriteProfileRequest
import me.arycer.leaguetracker.dto.favorite.FavoriteProfileResponse
import me.arycer.leaguetracker.service.FavoriteProfileService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.util.*

@RestController
@RequestMapping("/api/lol/favorites")
class FavoriteProfileController(
    private val service: FavoriteProfileService,
) {

    @GetMapping
    fun getFavorites(principal: Principal): List<FavoriteProfileResponse> {
        val userId = principal.name
        return service.getFavoritesForUser(userId)
    }

    @PostMapping
    fun addFavorite(
        principal: Principal,
        @RequestBody request: AddFavoriteProfileRequest
    ): ResponseEntity<FavoriteProfileResponse> {
        val userId = principal.name
        val result = service.addFavorite(userId, request)
        return ResponseEntity.ok(result)
    }

    @DeleteMapping("/{id}")
    fun deleteFavorite(
        principal: Principal,
        @PathVariable id: UUID
    ): ResponseEntity<Any> {
        val userId = principal.name
        val deleted = service.deleteFavorite(userId, id)
        return if (deleted) ResponseEntity.ok(mapOf("deleted" to true))
        else ResponseEntity.status(403).body(mapOf("error" to "Unauthorized or not found"))
    }
}
