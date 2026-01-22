import { ZahlungsplanItem } from './zahlungsplan-item.model';

export interface Finanzierung {
    laufzeit: number;
    darlehen: number;
    zinsatz: number;
    tilgungsSatz: number;
    monatlicheAnnuitaet: number;
    restbetrag: number;
    monatlicheSondertilgung: number;
    jaehrlicheSondertilgung: number;
    zahlungsplan: ZahlungsplanItem[];
}
