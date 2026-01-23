package de.thomcz.backend.service

import de.thomcz.backend.domain.FinanzierungsRechner
import de.thomcz.backend.domain.Zahlung
import de.thomcz.backend.model.Finanzierung
import de.thomcz.backend.model.ZahlungsplanItem
import org.springframework.stereotype.Service

@Service
class FinanzierungService {

    fun calculateFinanzierung(
        laufzeit: Int,
        darlehen: Double,
        zinsatz: Double,
        tilgungsSatz: Double,
        monatlicheSondertilgung: Double = 0.0
    ): Finanzierung {
        val rechner = FinanzierungsRechner(
            laufzeit = laufzeit,
            darlehen = darlehen,
            zinsatz = zinsatz,
            tilgungsSatz = tilgungsSatz,
            monatlicheSondertilgung = monatlicheSondertilgung
        )

        val ergebnis = rechner.berechne()

        return Finanzierung(
            laufzeit = ergebnis.laufzeit,
            darlehen = ergebnis.darlehen,
            zinsatz = ergebnis.zinsatz,
            tilgungsSatz = ergebnis.tilgungsSatz,
            monatlicheAnnuitaet = ergebnis.monatlicheAnnuitaet,
            restbetrag = ergebnis.restbetrag,
            monatlicheSondertilgung = ergebnis.monatlicheSondertilgung,
            jaehrlicheSondertilgung = ergebnis.jaehrlicheSondertilgung,
            zahlungsplan = ergebnis.zahlungsplan.map { it.toDto() }
        )
    }

    private fun Zahlung.toDto() = ZahlungsplanItem(
        monat = monat,
        anfangsBestand = anfangsBestand,
        zinsBetrag = zinsBetrag,
        tilgungsBetrag = tilgungsBetrag,
        sondertilgung = sondertilgung,
        endBestand = endBestand
    )
}
