package de.thomcz.backend.domain

data class FinanzierungsErgebnis(
    val laufzeit: Int,
    val darlehen: Double,
    val zinsatz: Double,
    val tilgungsSatz: Double,
    val monatlicheAnnuitaet: Double,
    val restbetrag: Double,
    val monatlicheSondertilgung: Double,
    val jaehrlicheSondertilgung: Double,
    val zahlungsplan: List<Zahlung>
)

class FinanzierungsRechner(
    private val laufzeit: Int,
    private val darlehen: Double,
    private val zinsatz: Double,
    private val tilgungsSatz: Double,
    private val monatlicheSondertilgung: Double = 0.0
) {
    fun berechne(): FinanzierungsErgebnis {
        var anfangsBestand = darlehen
        val zahlungsplan = mutableListOf<Zahlung>()
        val monatlicheAnnuitaet = berechneMonatlicheAnnuitaet()

        for (month in 0 until laufzeit) {
            if (anfangsBestand <= 0) break

            val actualSondertilgung = berechneSondertilgung(anfangsBestand, monatlicheAnnuitaet)
            val zahlung = Zahlung.berechne(month + 1, anfangsBestand, zinsatz, monatlicheAnnuitaet, actualSondertilgung)
            anfangsBestand = zahlung.endBestand
            zahlungsplan.add(zahlung)
        }

        val restbetrag = maxOf(0.0, anfangsBestand)
        val benoetigteSondertilgung = if (laufzeit > 0) restbetrag / laufzeit else 0.0
        val jaehrlicheSondertilgung = benoetigteSondertilgung * 12

        return FinanzierungsErgebnis(
            laufzeit = laufzeit,
            darlehen = darlehen,
            zinsatz = zinsatz,
            tilgungsSatz = tilgungsSatz,
            monatlicheAnnuitaet = monatlicheAnnuitaet,
            restbetrag = restbetrag,
            monatlicheSondertilgung = benoetigteSondertilgung,
            jaehrlicheSondertilgung = jaehrlicheSondertilgung,
            zahlungsplan = zahlungsplan
        )
    }

    private fun berechneMonatlicheAnnuitaet(): Double {
        val zinsBetrag = (darlehen * zinsatz) / 1200
        val tilgungsBetrag = (darlehen * tilgungsSatz) / 1200
        return zinsBetrag + tilgungsBetrag
    }

    private fun berechneSondertilgung(anfangsBestand: Double, monatlicheAnnuitaet: Double): Double {
        val minTilgung = monatlicheAnnuitaet - (anfangsBestand * zinsatz) / 1200
        return minOf(monatlicheSondertilgung, maxOf(0.0, anfangsBestand - minTilgung))
    }
}
