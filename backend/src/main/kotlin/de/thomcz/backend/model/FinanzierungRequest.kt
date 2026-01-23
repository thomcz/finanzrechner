package de.thomcz.backend.model

data class FinanzierungRequest(
    val laufzeit: Int,
    val darlehen: Double,
    val zinsatz: Double,
    val tilgungsSatz: Double,
    val monatlicheSondertilgung: Double = 0.0
)
