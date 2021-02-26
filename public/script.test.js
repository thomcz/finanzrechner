const { Finanzierung, ZahlungsplanItem } = require('./script');

describe('Zahlungsitem', () => {
  it('should calculate monatliche annuitaet', () => {
    const zahlungsItem = new ZahlungsplanItem(0, 100);

    const monatlicheAnnuitaet = zahlungsItem.calculateMonatlicheAnnuitaet(2, 1)

    expect(monatlicheAnnuitaet).toBe(0.25);
  });

  it('should calculate eine monatliche zahlung', () => {
    const zahlungsItem = new ZahlungsplanItem(0, 100);
    const zinsatz = 5
    const monatlicheAnnuitaet = 1

    const zahlung = zahlungsItem.calculateZahlung(zinsatz, monatlicheAnnuitaet)

    expect(zahlung.zinsBetrag).toBeCloseTo(0.42);
    expect(zahlung.tilgungsBetrag).toBeCloseTo(0.58);
    expect(zahlung.endBestand).toBeCloseTo(99.42);
  });
});


describe('Finanzierung', () => {
  it('should calculate finanzierung', () => {
    const laufzeit = 50
    const darlehen = 100
    const zinsatz = 10
    const tilgungsSatz = 10

    let finanzierung = new Finanzierung(laufzeit, darlehen, zinsatz, tilgungsSatz).calculateFinanzierung();

    expect(finanzierung.monatlicheAnnuitaet).toBeCloseTo(1.67);
    expect(finanzierung.restbetrag).toBeCloseTo(48.57);

    const letzteZahlung = finanzierung.zahlungsplan[finanzierung.zahlungsplan.length - 1]

    expect(letzteZahlung.zinsBetrag).toBeCloseTo(0.42);
    expect(letzteZahlung.tilgungsBetrag).toBeCloseTo(1.25);
    expect(letzteZahlung.endBestand).toBeCloseTo(48.57);
  });
});
