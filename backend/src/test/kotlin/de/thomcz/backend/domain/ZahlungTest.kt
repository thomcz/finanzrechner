package de.thomcz.backend.domain

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class ZahlungTest {

    @Test
    fun `berechne should calculate first payment correctly`() {
        val monatlicheAnnuitaet = 416.67
        val result = Zahlung.berechne(1, 100000.0, 3.0, monatlicheAnnuitaet)

        assertEquals(1, result.monat)
        assertEquals(100000.0, result.anfangsBestand, 0.01)
        assertEquals(250.0, result.zinsBetrag, 0.01)
        assertEquals(166.67, result.tilgungsBetrag, 0.01)
        assertEquals(0.0, result.sondertilgung, 0.01)
        assertEquals(99833.33, result.endBestand, 0.01)
    }

    @Test
    fun `berechne should include sondertilgung in calculation`() {
        val monatlicheAnnuitaet = 416.67
        val sondertilgung = 100.0
        val result = Zahlung.berechne(1, 100000.0, 3.0, monatlicheAnnuitaet, sondertilgung)

        assertEquals(1, result.monat)
        assertEquals(100000.0, result.anfangsBestand, 0.01)
        assertEquals(250.0, result.zinsBetrag, 0.01)
        assertEquals(166.67, result.tilgungsBetrag, 0.01)
        assertEquals(100.0, result.sondertilgung, 0.01)
        assertEquals(99733.33, result.endBestand, 0.01)
    }
}
