package de.thomcz.backend.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import kotlin.math.abs

class FinanzierungServiceTest {

    private val service = FinanzierungService()

    @Test
    fun `calculateMonatlicheAnnuitaet should calculate correctly`() {
        val result = service.calculateMonatlicheAnnuitaet(100000.0, 3.0, 2.0)
        // (100000 * 3.0) / 1200 + (100000 * 2.0) / 1200 = 250 + 166.67 = 416.67
        assertEquals(416.67, result, 0.01)
    }

    @Test
    fun `calculateZahlung should calculate first payment correctly`() {
        val monatlicheAnnuitaet = 416.67
        val result = service.calculateZahlung(1, 100000.0, 3.0, monatlicheAnnuitaet)

        assertEquals(1, result.monat)
        assertEquals(100000.0, result.anfangsBestand, 0.01)
        assertEquals(250.0, result.zinsBetrag, 0.01)
        assertEquals(166.67, result.tilgungsBetrag, 0.01)
        assertEquals(0.0, result.sondertilgung, 0.01)
        assertEquals(99833.33, result.endBestand, 0.01)
    }

    @Test
    fun `calculateZahlung should include sondertilgung in calculation`() {
        val monatlicheAnnuitaet = 416.67
        val sondertilgung = 100.0
        val result = service.calculateZahlung(1, 100000.0, 3.0, monatlicheAnnuitaet, sondertilgung)

        assertEquals(1, result.monat)
        assertEquals(100000.0, result.anfangsBestand, 0.01)
        assertEquals(250.0, result.zinsBetrag, 0.01)
        assertEquals(166.67, result.tilgungsBetrag, 0.01)
        assertEquals(100.0, result.sondertilgung, 0.01)
        assertEquals(99733.33, result.endBestand, 0.01)
    }

    @Test
    fun `calculateFinanzierung should return correct result for 12 months`() {
        val result = service.calculateFinanzierung(12, 100000.0, 3.0, 2.0)

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
    fun `calculateFinanzierung should calculate sondertilgung correctly`() {
        val result = service.calculateFinanzierung(12, 100000.0, 3.0, 2.0)

        // restbetrag / laufzeit = monatlicheSondertilgung
        val expectedMonatlicheSondertilgung = result.restbetrag / 12
        assertEquals(expectedMonatlicheSondertilgung, result.monatlicheSondertilgung, 0.01)

        // restbetrag / laufzeit * 12 = jaehrlicheSondertilgung
        val expectedJaehrlicheSondertilgung = result.restbetrag / 12 * 12
        assertEquals(expectedJaehrlicheSondertilgung, result.jaehrlicheSondertilgung, 0.01)
    }

    @Test
    fun `calculateFinanzierung with monatliche sondertilgung should reduce restbetrag`() {
        val resultWithoutSondertilgung = service.calculateFinanzierung(12, 100000.0, 3.0, 2.0)
        val resultWithSondertilgung = service.calculateFinanzierung(12, 100000.0, 3.0, 2.0, 500.0)

        // With Sondertilgung, the remaining amount should be lower
        assert(resultWithSondertilgung.restbetrag < resultWithoutSondertilgung.restbetrag)

        // Each payment should include the Sondertilgung
        assertEquals(500.0, resultWithSondertilgung.zahlungsplan[0].sondertilgung, 0.01)
    }
}
