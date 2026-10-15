# Scores van alle tablets in één Google Sheet

Eenmalig instellen (ongeveer 10 minuten):

1. Ga naar sheets.google.com en maak een **nieuwe lege spreadsheet**, bijvoorbeeld "Capaldi Kids – scores".
2. Kies in het menu **Extensies → Apps Script**.
3. Verwijder de voorbeeldcode en plak de volledige inhoud van `Code.gs` (uit deze map). Klik op **Opslaan**.
4. Klik rechtsboven op **Implementeren → Nieuwe implementatie**.
   - Klik op het tandwiel en kies **Web-app**.
   - *Uitvoeren als*: **Ik**.
   - *Wie heeft toegang*: **Iedereen**.
   - Klik **Implementeren** en geef toestemming (kies je account → Geavanceerd → Ga naar … → Toestaan).
5. Kopieer de **URL van de web-app** (eindigt op `/exec`).
6. Plak die URL in het spel: houd op de tablet het Capaldi-logo 2 seconden ingedrukt → *Scores naar Google Sheet* → plakken → *Opslaan en testen*. (Of stuur hem naar De Robotfabriek, dan wordt hij voor alle tablets ingebouwd.)

Daarna verschijnt elke opgeslagen score in het tabblad **Scores**. Het tabblad **Winnaars per maand** toont per spel en groep de hoogste score van de maand in cel B1 (pas B1 aan, bv. `2026-11`, om een andere maand te zien).

Er worden alleen bijnamen en scores verstuurd, geen echte namen of andere gegevens.
