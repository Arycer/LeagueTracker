package me.arycer.leaguetracker.service

import com.fasterxml.jackson.databind.ObjectMapper
import me.arycer.leaguetracker.dto.timeline.TimelineDto
import me.arycer.leaguetracker.entity.TimelineEntity
import me.arycer.leaguetracker.repository.TimelineRepository
import org.springframework.stereotype.Service

@Service
class TimelineCacheService(
    private val timelineRepository: TimelineRepository,
    private val objectMapper: ObjectMapper,
    private val riotService: RiotService
) {
    fun getTimelineByMatchId(matchId: String): TimelineDto {
        val cached = timelineRepository.findById(matchId)
        if (cached.isPresent) {
            return objectMapper.readValue(cached.get().timelineJson, TimelineDto::class.java)
        }

        val timelineDto = riotService.fetchTimelineFromApi(matchId)
        val json = objectMapper.writeValueAsString(timelineDto)

        timelineRepository.save(TimelineEntity(matchId = matchId, timelineJson = json))

        return timelineDto
    }
}
