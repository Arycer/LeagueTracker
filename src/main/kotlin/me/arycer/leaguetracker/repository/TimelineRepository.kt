package me.arycer.leaguetracker.repository

import me.arycer.leaguetracker.entity.TimelineEntity
import org.springframework.data.jpa.repository.JpaRepository

interface TimelineRepository : JpaRepository<TimelineEntity, String>
