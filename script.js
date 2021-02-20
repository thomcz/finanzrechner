function calculateRestbetragWithMonatlicherAufwand() {
    const laufzeit = parseFloat(document.getElementById("laufzeit").value)
    const darlehen = parseFloat(document.getElementById("darlehen").value)
    const zinsatz = parseFloat(document.getElementById("zinsatz").value)
    const monatlicherBetrag = parseFloat(document.getElementById("monatlicherBetrag").value)

    const restbetrag = darlehen - ((darlehen * laufzeit * ((((monatlicherBetrag * 12) * 100) / darlehen) + zinsatz)) / 100)

    document.getElementById("restbetrag").value = restbetrag
}

function calculateRestbetragWithTilgungSatz() {
    const laufzeit = parseFloat(document.getElementById("laufzeit").value)
    const darlehen = parseFloat(document.getElementById("darlehen").value)
    const zinsatz = parseFloat(document.getElementById("zinsatz").value)
    const tilgungsSatz = parseFloat(document.getElementById("tilgungsSatz").value)

    const restbetrag = darlehen - (darlehen * laufzeit * (tilgungsSatz + zinsatz)) / 100

    document.getElementById("restbetrag").value = restbetrag
}

function calculateMonatlicherBetrag() {
    const laufzeit = parseFloat(document.getElementById("laufzeit").value)
    const darlehen = parseFloat(document.getElementById("darlehen").value)
    const zinsatz = parseFloat(document.getElementById("zinsatz").value)
    const restbetrag = parseFloat(document.getElementById("restbetrag").value)

    const monatlicherBetrag = ((-darlehen * laufzeit * zinsatz) + (100 * darlehen) - (100 * restbetrag)) / (1200 * laufzeit)

    document.getElementById("monatlicherBetrag").value = monatlicherBetrag
}

function calculateSondertilgung() {
    const restbetrag = parseFloat(document.getElementById("restbetrag").value)
    const laufzeit = parseFloat(document.getElementById("laufzeit").value)

    const jaehrlicheSondertilgung = restbetrag / laufzeit
    const monatlicheSondertilgung = jaehrlicheSondertilgung / 12


    document.getElementById("jaehrlicheSondertilgung").value = jaehrlicheSondertilgung
    document.getElementById("monatlicheSondertilgung").value = monatlicheSondertilgung
}
