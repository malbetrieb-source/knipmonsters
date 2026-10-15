# Knipmonsters – Capaldi Kappers

Kinderspel van Capaldi Kappers. Kinderen trimmen eerst de baard van een wild monster met de tondeuse (level 1) en knippen daarna het haar met de schaar (level 2). Met sterren spelen ze nieuwe kappers van de Capaldi Crew vrij.

Doel: de kapper minder spannend maken voor kinderen, en met een klassement prijzen weggeven in de salon.

## Spellen
- **Knipmonsters** – level 1 tondeuse, level 2 schaar. Föhnaldo, Knip Kardashian, Professor Gelda en Wilma Wortelwax hebben elk een eigen level 3 (föhnen, fotomoment, gel-formule, waxen).
- **Kapperskleurplaat** – 7 platen (monsters, Lokkie, Haarriët, Föhnaldo, kappersspullen) inkleuren met vullen, kwast en gum. Afgemaakte platen worden per apparaat bewaard en zijn op te slaan als PNG of te printen, met Capaldi-rand. Lege platen zijn ook te printen voor in de salon.
- **Kappersmemory** – paren zoeken met de spullen van de kapper; bij elk paar legt de kapper uit wat het is.

Nieuwe kappers spelen zich vrij met sterren (max. 15: 12 uit Knipmonsters, 3 uit memory) en stellen zich dan voor.

## Testen
`index.html?test` zet een testhaakje (`window.__KM`) aan voor automatisch testen.

## Spelen
Open `index.html` in een browser, of via GitHub Pages.

## Opbouw
- `index.html` – schermen: uitleg, monsterkeuze, spelen, uitslag
- `css/style.css` – vormgeving
- `js/game.js` – spel, personages, uitleg en geluid (alles getekend op canvas, geen externe afbeeldingen)
- `assets/` – Capaldi-logo en icoon

## Goed om te weten
- Scores, sterren, gekozen kapper en schermkeuze worden per apparaat bewaard (localStorage). Er is nog geen gedeeld klassement.
- Leeftijden 4–12+ bepalen de moeilijkheid (stilstaan → wild bewegen).
- De stemmen gebruiken de voorleesstem van het apparaat (Web Speech API).

Gemaakt door De Robotfabriek.
