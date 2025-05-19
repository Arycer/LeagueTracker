package me.arycer.leaguetracker.dto.leaguetracker

import lombok.Getter

@Getter
enum class Region(descriptor: String, policy: Policy, apiName: String) {
    NA("North America", Policy.AMERICAS, "na1"),
    EUW("Europe West", Policy.EUROPE, "euw1"),
    EUNE("Europe Northern-East", Policy.EUROPE, "eun1"),
    KR("Korea", Policy.ASIA, "kr"),
    BR("Brazil", Policy.AMERICAS, "br1"),
    LAN("Latin America North", Policy.AMERICAS, "la1"),
    LAS("Latin America South", Policy.AMERICAS, "la2");

    private val descriptor: String?
    private val policy: Policy?
    private val apiName: String?

    init {
        this.descriptor = descriptor
        this.policy = policy
        this.apiName = apiName
    }

    enum class Policy {
        AMERICAS,
        ASIA,
        EUROPE
    }
}
