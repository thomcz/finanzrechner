package de.thomcz.backend.model

data class Finanzierung(
    val laufzeit: Int,
    val darlehen: Double,
    val zinsatz: Double,
    val tilgungsSatz: Double,
    val monatlicheAnnuitaet: Double,
    val restbetrag: Double,
    val monatlicheSondertilgung: Double,
    val jaehrlicheSondertilgung: Double,
    val zahlungsplan: List<ZahlungsplanItem>
)
