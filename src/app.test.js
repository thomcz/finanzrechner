import { calculateFinanzierung, calculateMonatlicheAnnuitaet, calculateZahlung  } from './app.js';

describe('FinanzierungsCalculator', () => {
  it('should calculate eine monatliche zahlung', () => {
    const zinsatz = 5
    const monatlicheAnnuitaet = 1

    const zahlung = calculateZahlung(0, 100, zinsatz, monatlicheAnnuitaet)

    expect(zahlung.zinsBetrag).toBeCloseTo(0.42);
    expect(zahlung.tilgungsBetrag).toBeCloseTo(0.58);
    expect(zahlung.endBestand).toBeCloseTo(99.42);
  });
  
  it('should calculate monatliche annuitaet', () => {
    const monatlicheAnnuitaet = calculateMonatlicheAnnuitaet(100, 2, 1)

    expect(monatlicheAnnuitaet).toBe(0.25);
  });

  it('should calculate finanzierung', () => {
    const laufzeit = 50
    const darlehen = 100
    const zinsatz = 10
    const tilgungsSatz = 10

    let finanzierung = calculateFinanzierung(laufzeit, darlehen, zinsatz, tilgungsSatz);

    expect(finanzierung.monatlicheAnnuitaet).toBeCloseTo(1.67);
    expect(finanzierung.restbetrag).toBeCloseTo(48.57);

    const letzteZahlung = finanzierung.zahlungsplan[finanzierung.zahlungsplan.length - 1]

    expect(letzteZahlung.zinsBetrag).toBeCloseTo(0.42);
    expect(letzteZahlung.tilgungsBetrag).toBeCloseTo(1.25);
    expect(letzteZahlung.endBestand).toBeCloseTo(48.57);
  });
});
