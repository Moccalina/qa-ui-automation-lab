# 🎭 Playwright QA Automation Portfolio Lab

Herzlich willkommen in meinem QA-Automations-Labor! In diesem Repository befindet sich eine voll automatisierte **End-to-End (E2E) Testsuite**, die ich mit **Playwright (JavaScript)** für mein QA-Portfolio entwickelt habe.

## 🔗 Live-Projekt
Die getestete Anwendung ist live auf meinem Portfolio-Blog zu finden:
👉 [Color Pairs Memory Game](https://qa-ui-automation.blogspot.com/p/color-pairs-5-level-game.html)

---

## 🚀 Was wird getestet?

Die Testsuite deckt die kritischen Kernbereiche der Webanwendung ab und ist in logische Testphasen unterteilt:

### 1. UI & Compliance-Tests
*   **Layout & Responsivität:** Verifikation der Hauptelemente auf der Startseite.
*   **Rechtliche Absicherung:** Überprüfung der Sichtbarkeit und Funktionalität von Impressum und Datenschutz.
*   **Cookie-Banner-Interaktion:** Dynamisches Erkennen und Bestätigen des rechtlichen Cookie-Hinweises über stabile IDs.

### 2. Funktionale Spielelogik (End-to-End)
*   **User Journeys (Level 1 bis 5):** Vollautomatisches Durchspielen aller Schwierigkeitsgrade.
*   **DOM-Analyse & Daten-Einzigartigkeit:** Der Test liest vorab verdeckte HTML-Attribute (`data-color`, `data-pair-label`) aus, um mathematisch zu beweisen, dass der Mischer-Algorithmus fehlerfreie, einzigartige Paare generiert.
*   **Zustands- & Zähler-Verifikation:** Prüfung des Züge-Zählers (State-Management) nach validen Zügen.
*   **Dynamische Klick-Journey:** Ein krisensicherer Klick-Algorithmus löst das Spielfeld vollautomatisch bis zur Siegesmeldung auf.

---

## 🛠️ Tech-Stack & Tools
*   **Framework:** Playwright (E2E Testing Framework)
*   **Sprache:** JavaScript (Node.js)
*   **IDE:** Visual Studio Code
*   **Version Control:** Git & GitHub

---

## 💻 Tests lokal ausführen

1. Dieses Repository klonen oder herunterladen.
2. Projektabhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Die Tests im interaktiven UI-Modus starten:
   ```bash
   npx playwright test --ui
   ```
