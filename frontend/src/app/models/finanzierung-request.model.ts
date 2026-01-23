export interface FinanzierungRequest {
    laufzeit: number;
    darlehen: number;
    zinsatz: number;
    tilgungsSatz: number;
    monatlicheSondertilgung?: number;
}
