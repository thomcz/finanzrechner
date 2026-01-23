package de.thomcz.backend.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class FinanzierungServiceTest {

    private val service = FinanzierungService()

    @Test
    fun `calculateFinanzierung should return correct DTO`() {
        val result = service.calculateFinanzierung(12, 100000.0, 3.0, 2.0)

        assertEquals(12, result.laufzeit)
        assertEquals(100000.0, result.darlehen, 0.01)
        assertEquals(3.0, result.zinsatz, 0.01)
        assertEquals(2.0, result.tilgungsSatz, 0.01)
        assertEquals(416.67, result.monatlicheAnnuitaet, 0.01)
        assertEquals(12, result.zahlungsplan.size)
    }

    @Test
    fun `calculateFinanzierung should map zahlungsplan correctly`() {
        val result = service.calculateFinanzierung(12, 100000.0, 3.0, 2.0)

        // Verify first payment is mapped correctly
        val firstPayment = result.zahlungsplan[0]
        assertEquals(1, firstPayment.monat)
        assertEquals(100000.0, firstPayment.anfangsBestand, 0.01)
        assertEquals(250.0, firstPayment.zinsBetrag, 0.01)
        assertEquals(166.67, firstPayment.tilgungsBetrag, 0.01)
    }

    @Test
    fun `calculateFinanzierung with sondertilgung should pass to domain`() {
        val result = service.calculateFinanzierung(12, 100000.0, 3.0, 2.0, 500.0)

        assertEquals(500.0, result.zahlungsplan[0].sondertilgung, 0.01)
    }
}
