package de.thomcz.backend.service

import de.thomcz.backend.model.Finanzierung
import de.thomcz.backend.model.ZahlungsplanItem
import org.springframework.stereotype.Service

@Service
class FinanzierungService {

    fun calculateFinanzierung(laufzeit: Int, darlehen: Double, zinsatz: Double, tilgungsSatz: Double): Finanzierung {
        var anfangsBestand = darlehen
        val zahlungsplan = mutableListOf<ZahlungsplanItem>()

        val monatlicheAnnuitaet = calculateMonatlicheAnnuitaet(anfangsBestand, zinsatz, tilgungsSatz)

        for (month in 0 until laufzeit) {
            val zahlungsplanItem = calculateZahlung(month + 1, anfangsBestand, zinsatz, monatlicheAnnuitaet)
            anfangsBestand -= zahlungsplanItem.tilgungsBetrag
            zahlungsplan.add(zahlungsplanItem)
        }

        val restbetrag = anfangsBestand
        val monatlicheSondertilgung = restbetrag / laufzeit
        val jaehrlicheSondertilgung = restbetrag / laufzeit * 12

        return Finanzierung(
            laufzeit = laufzeit,
            darlehen = darlehen,
            zinsatz = zinsatz,
            tilgungsSatz = tilgungsSatz,
            monatlicheAnnuitaet = monatlicheAnnuitaet,
            restbetrag = restbetrag,
            monatlicheSondertilgung = monatlicheSondertilgung,
            jaehrlicheSondertilgung = jaehrlicheSondertilgung,
            zahlungsplan = zahlungsplan
        )
    }

    fun calculateMonatlicheAnnuitaet(anfangsBestand: Double, zinsatz: Double, tilgungsSatz: Double): Double {
        val zinsBetrag = (anfangsBestand * zinsatz) / 1200
        val tilgungsBetrag = (anfangsBestand * tilgungsSatz) / 1200
        return zinsBetrag + tilgungsBetrag
    }

    fun calculateZahlung(monat: Int, anfangsBestand: Double, zinsatz: Double, monatlicheAnnuitaet: Double): ZahlungsplanItem {
        val zinsBetrag = (anfangsBestand * zinsatz) / 1200
        val tilgungsBetrag = monatlicheAnnuitaet - zinsBetrag
        val endBestand = anfangsBestand - tilgungsBetrag
        return ZahlungsplanItem(
            monat = monat,
            anfangsBestand = anfangsBestand,
            zinsBetrag = zinsBetrag,
            tilgungsBetrag = tilgungsBetrag,
            endBestand = endBestand
        )
    }
}
