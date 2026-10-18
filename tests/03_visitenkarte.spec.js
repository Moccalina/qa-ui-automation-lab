const { test, expect } = require('@playwright/test');

test('Prüfen, ob das Portfolio-Projekt existiert', async ({ page }) => {
  // Startseite aufrufen
  await page.goto('https://qa-ui-automation.blogspot.com/2026/10/willkommen-in-meinem-qa-automation-lab.html');

  // Wir suchen nach einem Text, der definitiv auf der Startseite steht
  const visitenkarteText = page.locator('text=Willkommen in meinem QA & Automation Lab!');

  // Prüfen, ob der Text sichtbar ist
  await expect(visitenkarteText).toBeVisible({ timeout: 5000 });
  
  console.log('🎉 Test erfolgreich! Die Visitenkarte wurde geladen.');
});

test('QA-Check: Portfolio-Projekte auf der Visitenkarte korrekt zählen', async ({ page }) => {

  // 1. Startseite aufrufen

  await page.goto('https://qa-ui-automation.blogspot.com/2026/10/willkommen-in-meinem-qa-automation-lab.html');



  // 2. Wir suchen die h4-Überschrift, die den Text "Portfolio" enthält

  const portfolioUeberschrift = page.locator('h4:has-text("Portfolio")');

  

  // Zur Sicherheit prüfen wir, ob die Überschrift überhaupt da ist

  await expect(portfolioUeberschrift).toBeVisible({ timeout: 5000 });



  // 3. JETZT DER TRICK: suchen nach den Projektboxen, die NACH dieser h4-Überschrift kommen.

  // Wir nutzen dafür das offizielle "The Project:"-Merkmal in den Boxen.

  // Das "+" oder "~" im CSS-Locator sorgt dafür, dass nur Geschwister-Elemente gezählt werden.

  const echteProjektBoxen = page.locator('h4:has-text("Portfolio") ~ div:has-text("Das Projekt")');



  // 4. Playwright wartet intelligent, bis exakt 2 dieser echten Boxen da sind

  await expect(echteProjektBoxen).toHaveCount(2, { timeout: 5000 });



  // 5. Den Zählerstand für das Terminal auslesen

  const anzahl = await echteProjektBoxen.count();

  console.log(`🎉 Test erfolgreich! Anzahl der echten Portfolio-Projekte: ${anzahl}`);

});
