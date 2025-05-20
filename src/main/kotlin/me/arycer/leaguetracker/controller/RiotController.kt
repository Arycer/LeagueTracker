package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.match.MatchDto
import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.service.RiotService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/lol/match")
class RiotController(
    private val riotService: RiotService
) {

    @GetMapping("/matches")
    fun getMatchesByPuuid(
        @RequestParam puuid: String,
        @RequestParam region: Region,
        @RequestParam(required = false, defaultValue = "0") page: Int,
        @RequestParam(required = false, defaultValue = "20") pageSize: Int
    ): List<String> {
        val ps = pageSize.coerceIn(1, 20) // limitar a max 20 por página para evitar abuse
        return riotService.getMatchIdsByPuuid(puuid, region, page, ps)
    }

    // Endpoint para obtener información detallada de una partida
    @GetMapping("/match/{matchId}")
    fun getMatchInfo(
        @PathVariable matchId: String,
        @RequestParam region: Region
    ): MatchDto {
        return riotService.getMatchInfoByMatchId(matchId, region)
    }
}
