package me.arycer.leaguetracker

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class LeagueTrackerApplication

fun main(args: Array<String>) {
    runApplication<LeagueTrackerApplication>(*args)
}
