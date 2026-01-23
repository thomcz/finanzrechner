package de.thomcz.backend.model

data class ZahlungsplanItem(
    val monat: Int,
    val anfangsBestand: Double,
    val zinsBetrag: Double,
    val tilgungsBetrag: Double,
    val sondertilgung: Double,
    val endBestand: Double
)
