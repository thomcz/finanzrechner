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

    calculateFinanzierung() {
        let anfangsBestand = this.darlehen;
        let zahlungsplan = []

        let zahlungsplanItem = new ZahlungsplanItem(0, anfangsBestand)
        let monatlicheAnnuitaet = zahlungsplanItem.calculateMonatlicheAnnuitaet(this.zinsatz, this.tilgungsSatz)

        for (let month = 0; month < this.laufzeit; month++) {
            let zahlungsplanItem = new ZahlungsplanItem(month + 1, anfangsBestand)
            zahlungsplanItem = zahlungsplanItem.calculateZahlung(this.zinsatz, monatlicheAnnuitaet)
            anfangsBestand -= zahlungsplanItem.tilgungsBetrag
            zahlungsplan.push(zahlungsplanItem)
        }
        return new Finanzierung(this.laufzeit, this.darlehen, this.zinsatz, this.tilgungsSatz, monatlicheAnnuitaet, anfangsBestand, zahlungsplan)
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

    calculateZahlung(zinsatz, monatlicheAnnuitaet) {
        const zinsBetrag = (this.anfangsBestand * zinsatz) / 1200
        const tilgungsBetrag = monatlicheAnnuitaet - zinsBetrag
        const endBestand = this.anfangsBestand - tilgungsBetrag;
        return new ZahlungsplanItem(this.monat, this.anfangsBestand, zinsBetrag, tilgungsBetrag, endBestand)
    }

    calculateMonatlicheAnnuitaet(zinsatz, tilgungsSatz) {
        const zinsBetrag = (this.anfangsBestand * zinsatz) / 1200
        const tilgungsBetrag = (this.anfangsBestand * tilgungsSatz) / 1200
        return zinsBetrag + tilgungsBetrag;
    }
}

function calculate() {
    const laufzeit = parseFloat(document.getElementById("laufzeit").value)
    const darlehen = parseFloat(document.getElementById("darlehen").value)
    const zinsatz = parseFloat(document.getElementById("zinsatz").value)
    const tilgungsSatz = parseFloat(document.getElementById("tilgungsSatz").value)

    const finanzierung = new Finanzierung(laufzeit, darlehen, zinsatz, tilgungsSatz).calculateFinanzierung()

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

module.exports = { Finanzierung, ZahlungsplanItem }