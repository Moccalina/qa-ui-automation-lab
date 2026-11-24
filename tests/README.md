# 🎭 Playwright QA Automation Portfolio Lab

Herzlich willkommen in meinem QA-Automations-Labor! In diesem Repository befindet sich eine voll automatisierte **End-to-End (E2E) Testsuite**, die ich mit **Playwright (JavaScript)** für mein QA-Portfolio entwickelt habe.

## 🔗 Live-Projekt & Dokumentation
* 🎮 **Getestete Webanwendung (GitHub Pages):** [Color Pairs Memory Game](https://github.io)
* 📂 **Quellcode der Webanwendung:** [Moccalina/color-pairs-game](https://github.com)
* 📝 **QA-Case-Study & Monitoring-Doku:** [QA UI Automation Blog](https://blogspot.com)

---

## 🚀 Was wird getestet?

Die Testsuite deckt die kritischen Kernbereiche der Webanwendung ab und läuft automatisiert über **Desktop- (Desktop Chrome)** sowie **Mobile-Viewports (Mobile Chrome / Pixel 5)**:

### 1. Rechtliche Pflichtseiten & Navigation
* **Footer-Verifikation:** Prüfung, ob die Links zu **Impressum** und **Datenschutz** im Footer der Startseite sichtbar und anklickbar sind.
* **Inhalts- & Routing-Check:** Validierung der Ziel-URLs (`impressum.html`, `datenschutz.html`), der Überschriften, des vorhandenen Pflichttextes sowie des *„← Zurück zum Spiel“*-Buttons.

### 2. Funktionale Spielelogik (End-to-End)
* **User Journeys (Level 1 bis 5):** Vollautomatisches Durchspielen aller Schwierigkeitsgrade (9 bis 96 Kartenpaare) inklusive Intro-Interaktion.
* **DOM-Analyse & Daten-Einzigartigkeit:** Der Test liest vorab verdeckte HTML-Attribute (`data-color`, `data-pair-label`) aus, um mathematisch zu beweisen, dass der Mischer-Algorithmus fehlerfreie, einzigartige Paare generiert.
* **Farbthemen- & Filter-Validierung:** Prüfung aller 7 Farbmodi (u. a. Rot-, Blau-, Grün- und Graustufen-Paletten) auf korrekte Farbraum-Zugehörigkeit.
* **Zustands- & Zähler-Verifikation:** Prüfung des Züge-Zählers und Fortschrittsbalkens (State-Management) bis zur finalen Highscore-Speicherung (`localStorage`).
* **Dynamische Klick-Journey:** Ein stabiler Klick-Algorithmus löst das Spielfeld vollautomatisch bis zum Erfolgs-Popup auf.

---

## 🛠️ Tech-Stack & Tools
* **Framework:** Playwright (E2E Testing Framework)
* **CI/CD:** GitHub Actions (automatisierte Testläufe)
* **Sprache:** JavaScript (Node.js)
* **Version Control:** Git & GitHub

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
