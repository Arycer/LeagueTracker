package me.arycer.leaguetracker.dto.misc

enum class Region(var descriptor: String, var policy: Policy, var apiName: String) {
    NA("North America", Policy.AMERICAS, "na1"),
    EUW("Europe West", Policy.EUROPE, "euw1"),
    EUNE("Europe Northern-East", Policy.EUROPE, "eun1"),
    KR("Korea", Policy.ASIA, "kr"),
    BR("Brazil", Policy.AMERICAS, "br1"),
    LAN("Latin America North", Policy.AMERICAS, "la1"),
    LAS("Latin America South", Policy.AMERICAS, "la2");

    enum class Policy {
        AMERICAS,
        ASIA,
        EUROPE
    }
}
