package me.arycer.leaguetracker.dto.favorite

data class FavoriteProfileResponse(
    val id: String,
    val region: String,
    val summonerName: String,
    val tagline: String
)
