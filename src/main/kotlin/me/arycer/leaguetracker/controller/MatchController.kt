package me.arycer.leaguetracker.controller

import me.arycer.leaguetracker.dto.match.MatchDto
import me.arycer.leaguetracker.dto.misc.Region
import me.arycer.leaguetracker.dto.timeline.TimelineDto
import me.arycer.leaguetracker.service.RiotService
import me.arycer.leaguetracker.service.TimelineCacheService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/lol/match")
class MatchController(
    private val riotService: RiotService,
    private val timelineCacheService: TimelineCacheService
) {

    @GetMapping("/matches")
    fun getMatchesByPuuid(
        @RequestParam puuid: String,
        @RequestParam region: Region,
        @RequestParam(required = false, defaultValue = "0") page: Int,
        @RequestParam(required = false, defaultValue = "20") pageSize: Int
    ): List<String> {
        val ps = pageSize.coerceIn(1, 20)
        return riotService.getMatchIdsByPuuid(puuid, region, page, ps)
    }

    @GetMapping("/match/{matchId}")
    fun getMatchInfo(
        @PathVariable matchId: String,
        @RequestParam region: Region
    ): ResponseEntity<MatchDto?> {
        return try {
            ResponseEntity.ok(riotService.getMatchInfoByMatchId(matchId, region))
        } catch (_: Exception) {
            ResponseEntity.status(403).body(null)
        }
    }

    @GetMapping("/{matchId}/timeline")
    fun getTimeline(@PathVariable matchId: String): TimelineDto {
        return timelineCacheService.getTimelineByMatchId(matchId)
    }
}
