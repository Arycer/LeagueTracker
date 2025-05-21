package me.arycer.leaguetracker.dto.favorite

data class AddFavoriteProfileRequest(
    val region: String,
    val summonerName: String,
    val tagline: String
)
