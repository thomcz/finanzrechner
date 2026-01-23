package de.thomcz.backend.domain

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class FinanzierungsRechnerTest {

    @Test
    fun `berechne should return correct result for 12 months`() {
        val rechner = FinanzierungsRechner(
            laufzeit = 12,
            darlehen = 100000.0,
            zinsatz = 3.0,
            tilgungsSatz = 2.0
        )

        val result = rechner.berechne()

        assertEquals(12, result.laufzeit)
        assertEquals(100000.0, result.darlehen, 0.01)
        assertEquals(3.0, result.zinsatz, 0.01)
        assertEquals(2.0, result.tilgungsSatz, 0.01)
        assertEquals(416.67, result.monatlicheAnnuitaet, 0.01)
        assertEquals(12, result.zahlungsplan.size)

        // First payment
        assertEquals(1, result.zahlungsplan[0].monat)
        assertEquals(100000.0, result.zahlungsplan[0].anfangsBestand, 0.01)

        // Last payment
        assertEquals(12, result.zahlungsplan[11].monat)
    }

    @Test
    fun `berechne should calculate sondertilgung correctly`() {
        val rechner = FinanzierungsRechner(
            laufzeit = 12,
            darlehen = 100000.0,
            zinsatz = 3.0,
            tilgungsSatz = 2.0
        )

        val result = rechner.berechne()

        // restbetrag / laufzeit = monatlicheSondertilgung
        val expectedMonatlicheSondertilgung = result.restbetrag / 12
        assertEquals(expectedMonatlicheSondertilgung, result.monatlicheSondertilgung, 0.01)

        // restbetrag / laufzeit * 12 = jaehrlicheSondertilgung
        val expectedJaehrlicheSondertilgung = result.restbetrag / 12 * 12
        assertEquals(expectedJaehrlicheSondertilgung, result.jaehrlicheSondertilgung, 0.01)
    }

    @Test
    fun `berechne with monatliche sondertilgung should reduce restbetrag`() {
        val rechnerOhne = FinanzierungsRechner(
            laufzeit = 12,
            darlehen = 100000.0,
            zinsatz = 3.0,
            tilgungsSatz = 2.0
        )
        val rechnerMit = FinanzierungsRechner(
            laufzeit = 12,
            darlehen = 100000.0,
            zinsatz = 3.0,
            tilgungsSatz = 2.0,
            monatlicheSondertilgung = 500.0
        )

        val resultOhne = rechnerOhne.berechne()
        val resultMit = rechnerMit.berechne()

        // With Sondertilgung, the remaining amount should be lower
        assert(resultMit.restbetrag < resultOhne.restbetrag)

        // Each payment should include the Sondertilgung
        assertEquals(500.0, resultMit.zahlungsplan[0].sondertilgung, 0.01)
    }
}
