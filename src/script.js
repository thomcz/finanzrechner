const PRECISION = 2;

class Finanzierung {
    constructor(laufzeit, darlehen, zinsatz, tilgungsSatz, monatlicheAnnuitaet, restbetrag, zahlungsplan) {
        this.laufzeit = laufzeit
        this.darlehen = darlehen
        this.zinsatz = zinsatz
        this.tilgungsSatz = tilgungsSatz
        this.monatlicheAnnuitaet = monatlicheAnnuitaet
        this.restbetrag = restbetrag
        this.zahlungsplan = zahlungsplan
    }
}

class ZahlungsplanItem {
    constructor(monat, anfangsBestand, zinsBetrag, tilgungsBetrag, endBestand) {
        this.monat = monat
        this.anfangsBestand = anfangsBestand
        this.zinsBetrag = zinsBetrag
        this.tilgungsBetrag = tilgungsBetrag
        this.endBestand = endBestand
    }

}

export function calculateFinanzierung(laufzeit, darlehen, zinsatz, tilgungsSatz) {
    let anfangsBestand = darlehen;
    let zahlungsplan = []

    let monatlicheAnnuitaet = calculateMonatlicheAnnuitaet(anfangsBestand, zinsatz, tilgungsSatz)

    for (let month = 0; month < laufzeit; month++) {
        let zahlungsplanItem = calculateZahlung(month + 1, anfangsBestand, zinsatz, monatlicheAnnuitaet)
        anfangsBestand -= zahlungsplanItem.tilgungsBetrag
        zahlungsplan.push(zahlungsplanItem)
    }
    return new Finanzierung(laufzeit, darlehen, zinsatz, tilgungsSatz, monatlicheAnnuitaet, anfangsBestand, zahlungsplan)
}
export function calculateMonatlicheAnnuitaet(anfangsBestand, zinsatz, tilgungsSatz) {
    const zinsBetrag = (anfangsBestand * zinsatz) / 1200
    const tilgungsBetrag = (anfangsBestand * tilgungsSatz) / 1200
    return zinsBetrag + tilgungsBetrag;
}
export function calculateZahlung(monat, anfangsBestand, zinsatz, monatlicheAnnuitaet) {
    const zinsBetrag = (anfangsBestand * zinsatz) / 1200
    const tilgungsBetrag = monatlicheAnnuitaet - zinsBetrag
    const endBestand = anfangsBestand - tilgungsBetrag;
    return new ZahlungsplanItem(monat, anfangsBestand, zinsBetrag, tilgungsBetrag, endBestand)
}

async function main() {
    document.getElementById("calculate").addEventListener('click', calculate)
}

function calculate() {
    const laufzeit = parseFloat(document.getElementById("laufzeit").value)
    const darlehen = parseFloat(document.getElementById("darlehen").value)
    const zinsatz = parseFloat(document.getElementById("zinsatz").value)
    const tilgungsSatz = parseFloat(document.getElementById("tilgungsSatz").value)

    const finanzierung = calculateFinanzierung(laufzeit, darlehen, zinsatz, tilgungsSatz)

    document.getElementById("monatlicherBetrag").value = finanzierung.monatlicheAnnuitaet
    document.getElementById("restbetrag").value = finanzierung.restbetrag

    document.getElementById("jaehrlicheSondertilgung").value = finanzierung.restbetrag / finanzierung.laufzeit * 12
    document.getElementById("monatlicheSondertilgung").value = finanzierung.restbetrag / finanzierung.laufzeit

    setFinanzierungsplan(finanzierung.zahlungsplan);
}

function setFinanzierungsplan(zahlungsplan) {
    const table = document.getElementById("finanzierungsPlan");
    // do not remove header row
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    zahlungsplan.reverse().forEach(element => {
        var row = table.insertRow();
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell3 = row.insertCell(3);
        var cell4 = row.insertCell(4);
        cell0.innerHTML = element.monat;
        cell1.innerHTML = element.anfangsBestand;
        cell2.innerHTML = element.zinsBetrag;
        cell3.innerHTML = element.tilgungsBetrag;
        cell4.innerHTML = element.endBestand;
    });
}

window.onload = main;