package me.arycer.leaguetracker.service

import me.arycer.leaguetracker.dto.favorite.AddFavoriteProfileRequest
import me.arycer.leaguetracker.dto.favorite.FavoriteProfileResponse
import me.arycer.leaguetracker.entity.FavoriteProfile
import me.arycer.leaguetracker.repository.FavoriteProfileRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class FavoriteProfileService(
    private val favoriteRepo: FavoriteProfileRepository
) {

    fun getFavoritesForUser(userId: String): List<FavoriteProfileResponse> =
        favoriteRepo.findAllByUserId(userId).map { it.toResponse() }

    fun addFavorite(userId: String, request: AddFavoriteProfileRequest): FavoriteProfileResponse {
        val favorite = FavoriteProfile(
            userId = userId,
            region = request.region,
            summonerName = request.summonerName,
            tagline = request.tagline
        )
        return favoriteRepo.save(favorite).toResponse()
    }

    fun deleteFavorite(userId: String, id: UUID): Boolean {
        val fav = favoriteRepo.findById(id).orElse(null) ?: return false
        if (fav.userId != userId) return false

        favoriteRepo.delete(fav)
        return true
    }

    private fun FavoriteProfile.toResponse() = FavoriteProfileResponse(
        id = id.toString(),
        region = region,
        summonerName = summonerName,
        tagline = tagline
    )
}
