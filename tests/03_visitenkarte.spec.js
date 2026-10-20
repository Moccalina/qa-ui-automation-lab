const { test, expect } = require('@playwright/test');

test('Prüfen, ob das Portfolio-Projekt existiert', async ({ page }) => {
  // Startseite aufrufen
  await page.goto('https://qa-ui-automation.blogspot.com/2026/10/willkommen-in-meinem-qa-automation-lab.html');

  // Wir suchen nach einem Text, der definitiv auf der Startseite steht
  const visitenkarteText = page.locator('text=Willkommen in meinem QA & Automation Lab!');

  // CLOUD-OPTIMIERUNG: 10 Sekunden Puffer für langsamere Cloud-Server
  await expect(visitenkarteText).toBeVisible({ timeout: 10000 });
  
  console.log('🎉 Test erfolgreich! Die Visitenkarte wurde geladen.');
});

test('QA-Check: Portfolio-Projekte auf der Visitenkarte korrekt zählen', async ({ page }) => {
  // 1. Startseite aufrufen
  await page.goto('https://qa-ui-automation.blogspot.com/2026/10/willkommen-in-meinem-qa-automation-lab.html');

  // 2. Wir suchen die h4-Überschrift, die den Text "Portfolio" enthält
  const portfolioUeberschrift = page.locator('h4:has-text("Portfolio")');
  
  // Zur Sicherheit prüfen wir mit Puffer, ob die Überschrift da ist
  await expect(portfolioUeberschrift).toBeVisible({ timeout: 10000 });

  // 3. Projektboxen lokalisieren
  const echteProjektBoxen = page.locator('h4:has-text("Portfolio") ~ div:has-text("Das Projekt")');

  // 4. ZUKUNFTSSICHERER CHECK: Wir prüfen, ob MINDESTENS 2 Projekte vorhanden sind.
  // Das verhindert, dass der Test fehlschlägt, wenn Du neue Spiele/Projekte im Blog ergänzt!
  await expect(async () => {
    const anzahl = await echteProjektBoxen.count();
    expect(anzahl).toBeGreaterThanOrEqual(2);
  }).toPass({ timeout: 10000 });

  // 5. Die exakte Anzahl für das Protokoll auslesen
  const finaleAnzahl = await echteProjektBoxen.count();
  console.log(`🎉 Test erfolgreich! Anzahl der echten Portfolio-Projekte auf der Visitenkarte: ${finaleAnzahl}`);
});
