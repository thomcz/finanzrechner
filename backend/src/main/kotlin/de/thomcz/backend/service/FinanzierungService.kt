package de.thomcz.backend.service

import de.thomcz.backend.model.Finanzierung
import de.thomcz.backend.model.ZahlungsplanItem
import org.springframework.stereotype.Service

@Service
class FinanzierungService {

    fun calculateFinanzierung(laufzeit: Int, darlehen: Double, zinsatz: Double, tilgungsSatz: Double, monatlicheSondertilgung: Double = 0.0): Finanzierung {
        var anfangsBestand = darlehen
        val zahlungsplan = mutableListOf<ZahlungsplanItem>()

        val monatlicheAnnuitaet = calculateMonatlicheAnnuitaet(anfangsBestand, zinsatz, tilgungsSatz)

        for (month in 0 until laufzeit) {
            if (anfangsBestand <= 0) break

            val actualSondertilgung = minOf(monatlicheSondertilgung, maxOf(0.0, anfangsBestand - (monatlicheAnnuitaet - (anfangsBestand * zinsatz) / 1200)))
            val zahlungsplanItem = calculateZahlung(month + 1, anfangsBestand, zinsatz, monatlicheAnnuitaet, actualSondertilgung)
            anfangsBestand = zahlungsplanItem.endBestand
            zahlungsplan.add(zahlungsplanItem)
        }

        val restbetrag = maxOf(0.0, anfangsBestand)
        val neededMonatlicheSondertilgung = if (laufzeit > 0) restbetrag / laufzeit else 0.0
        val jaehrlicheSondertilgung = neededMonatlicheSondertilgung * 12

        return Finanzierung(
            laufzeit = laufzeit,
            darlehen = darlehen,
            zinsatz = zinsatz,
            tilgungsSatz = tilgungsSatz,
            monatlicheAnnuitaet = monatlicheAnnuitaet,
            restbetrag = restbetrag,
            monatlicheSondertilgung = neededMonatlicheSondertilgung,
            jaehrlicheSondertilgung = jaehrlicheSondertilgung,
            zahlungsplan = zahlungsplan
        )
    }

    fun calculateMonatlicheAnnuitaet(anfangsBestand: Double, zinsatz: Double, tilgungsSatz: Double): Double {
        val zinsBetrag = (anfangsBestand * zinsatz) / 1200
        val tilgungsBetrag = (anfangsBestand * tilgungsSatz) / 1200
        return zinsBetrag + tilgungsBetrag
    }

    fun calculateZahlung(monat: Int, anfangsBestand: Double, zinsatz: Double, monatlicheAnnuitaet: Double, sondertilgung: Double = 0.0): ZahlungsplanItem {
        val zinsBetrag = (anfangsBestand * zinsatz) / 1200
        val tilgungsBetrag = monatlicheAnnuitaet - zinsBetrag
        val endBestand = maxOf(0.0, anfangsBestand - tilgungsBetrag - sondertilgung)
        return ZahlungsplanItem(
            monat = monat,
            anfangsBestand = anfangsBestand,
            zinsBetrag = zinsBetrag,
            tilgungsBetrag = tilgungsBetrag,
            sondertilgung = sondertilgung,
            endBestand = endBestand
        )
    }
}
