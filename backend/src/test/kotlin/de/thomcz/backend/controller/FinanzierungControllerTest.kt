package de.thomcz.backend.controller

import de.thomcz.backend.model.FinanzierungRequest
import de.thomcz.backend.service.FinanzierungService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class FinanzierungControllerTest {

    private val service = FinanzierungService()
    private val controller = FinanzierungController(service)

    @Test
    fun `calculate endpoint should return finanzierung`() {
        val request = FinanzierungRequest(
            laufzeit = 12,
            darlehen = 100000.0,
            zinsatz = 3.0,
            tilgungsSatz = 2.0
        )

        val result = controller.calculate(request)

        assertEquals(12, result.laufzeit)
        assertEquals(100000.0, result.darlehen, 0.01)
        assertEquals(3.0, result.zinsatz, 0.01)
        assertEquals(2.0, result.tilgungsSatz, 0.01)
        assertEquals(416.67, result.monatlicheAnnuitaet, 0.01)
        assertEquals(12, result.zahlungsplan.size)
    }

    @Test
    fun `calculate endpoint should handle different values`() {
        val request = FinanzierungRequest(
            laufzeit = 24,
            darlehen = 200000.0,
            zinsatz = 4.0,
            tilgungsSatz = 3.0
        )

        val result = controller.calculate(request)

        assertEquals(24, result.laufzeit)
        assertEquals(200000.0, result.darlehen, 0.01)
        assertEquals(24, result.zahlungsplan.size)
    }

    @Test
    fun `calculate should handle zero input sondertilgung`() {
        val request = FinanzierungRequest(
            laufzeit = 12,
            darlehen = 100000.0,
            zinsatz = 3.0,
            tilgungsSatz = 2.0,
            monatlicheSondertilgung = 0.0
        )

        val result = controller.calculate(request)

        assertEquals(12, result.laufzeit)
        // All payments should have 0 sondertilgung since no input sondertilgung was provided
        result.zahlungsplan.forEach { zahlung ->
            assertEquals(0.0, zahlung.sondertilgung, 0.01)
        }
        // monatlicheSondertilgung and jaehrlicheSondertilgung are calculated fields
        // representing what would be needed to pay off the remaining balance
        assert(result.monatlicheSondertilgung >= 0)
        assert(result.jaehrlicheSondertilgung >= 0)
    }

    @Test
    fun `calculate should handle zero interest rate`() {
        val request = FinanzierungRequest(
            laufzeit = 12,
            darlehen = 100000.0,
            zinsatz = 0.0,
            tilgungsSatz = 2.0
        )

        val result = controller.calculate(request)

        assertEquals(12, result.laufzeit)
        assertEquals(0.0, result.zinsatz, 0.01)
        // With 0% interest, all zinsBetrag should be 0
        result.zahlungsplan.forEach { zahlung ->
            assertEquals(0.0, zahlung.zinsBetrag, 0.01)
        }
    }

    @Test
    fun `calculate should handle sondertilgung in request`() {
        val request = FinanzierungRequest(
            laufzeit = 12,
            darlehen = 100000.0,
            zinsatz = 3.0,
            tilgungsSatz = 2.0,
            monatlicheSondertilgung = 500.0
        )

        val result = controller.calculate(request)

        assertEquals(12, result.laufzeit)
        // First payment should include sondertilgung
        assert(result.zahlungsplan[0].sondertilgung > 0)
    }
}
