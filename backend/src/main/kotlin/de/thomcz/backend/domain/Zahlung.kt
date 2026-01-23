package de.thomcz.backend.domain

data class Zahlung(
    val monat: Int,
    val anfangsBestand: Double,
    val zinsBetrag: Double,
    val tilgungsBetrag: Double,
    val sondertilgung: Double,
    val endBestand: Double
) {
    companion object {
        fun berechne(
            monat: Int,
            anfangsBestand: Double,
            zinsatz: Double,
            monatlicheAnnuitaet: Double,
            sondertilgung: Double = 0.0
        ): Zahlung {
            val zinsBetrag = (anfangsBestand * zinsatz) / 1200
            val tilgungsBetrag = monatlicheAnnuitaet - zinsBetrag
            val endBestand = maxOf(0.0, anfangsBestand - tilgungsBetrag - sondertilgung)
            return Zahlung(
                monat = monat,
                anfangsBestand = anfangsBestand,
                zinsBetrag = zinsBetrag,
                tilgungsBetrag = tilgungsBetrag,
                sondertilgung = sondertilgung,
                endBestand = endBestand
            )
        }
    }
}
