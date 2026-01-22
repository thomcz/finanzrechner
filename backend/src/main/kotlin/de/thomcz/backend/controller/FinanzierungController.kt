package de.thomcz.backend.controller

import de.thomcz.backend.model.Finanzierung
import de.thomcz.backend.model.FinanzierungRequest
import de.thomcz.backend.service.FinanzierungService
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/finanzierung")
@CrossOrigin(origins = ["http://localhost:4200"])
class FinanzierungController(private val finanzierungService: FinanzierungService) {

    @PostMapping("/calculate")
    fun calculate(@RequestBody request: FinanzierungRequest): Finanzierung {
        return finanzierungService.calculateFinanzierung(
            laufzeit = request.laufzeit,
            darlehen = request.darlehen,
            zinsatz = request.zinsatz,
            tilgungsSatz = request.tilgungsSatz
        )
    }
}
