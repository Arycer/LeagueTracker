package me.arycer.leaguetracker.dto.timeline

data class ChampionStatsDto(
    val abilityHaste: Int,
    val abilityPower: Int,
    val armor: Int,
    val armorPen: Int,
    val armorPenPercent: Int,
    val attackDamage: Int,
    val attackSpeed: Int,
    val bonusArmorPenPercent: Int,
    val bonusMagicPenPercent: Int,
    val ccReduction: Int,
    val cooldownReduction: Int,
    val health: Int,
    val healthMax: Int,
    val healthRegen: Int,
    val lifesteal: Int,
    val magicPen: Int,
    val magicPenPercent: Int,
    val magicResist: Int,
    val movementSpeed: Int,
    val omnivamp: Int,
    val physicalVamp: Int,
    val power: Int,
    val powerMax: Int,
    val powerRegen: Int,
    val spellVamp: Int
)
