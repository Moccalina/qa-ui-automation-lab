const { test, expect } = require('@playwright/test');

test('Memory-Spiel: Vollständige User Journey durch Level 1 (Intro, Struktur & Karten-Interaktion)', async ({ page }) => {
  
  // STEP 1: Seite aufrufen
  await page.goto('https://qa-ui-automation.blogspot.com/p/color-pairs-5-level-game.html');

  // STEP 2: Intro überspringen
  const startButton = page.locator('#intro-screen button');
  await startButton.click();

  // STEP 3: Level 1 aktivieren und prüfen, ob das Spiel lädt
  const level1Button = page.locator('button:has-text("Level 1")');
  await level1Button.click();
  
  const zuegeAnzeige = page.locator('span.mini-label:has-text("Züge")');
  await expect(zuegeAnzeige).toBeVisible({ timeout: 5000 });

  // STEP 4: Struktur der Karten & Pfoten-Rückseite prüfen
  const alleKarten = page.locator('.card');
  await expect(alleKarten).toHaveCount(18, { timeout: 5000 });
  
  // Wir definieren "ersteKarte" hier genau EINMAL für den Rückseiten-Check
  const ersteKarte = alleKarten.first();
  await expect(ersteKarte).toHaveCSS('background-color', 'rgb(55, 65, 81)', { timeout: 5000 });
  await expect(ersteKarte).toHaveCSS('background-image', /data:image\/svg\+xml/, { timeout: 5000 });

  // STEP 5: Erste Karte anklicken und State-Wechsel prüfen
  // (Wir nutzen die oben bereits definierte Variable "ersteKarte" einfach ohne neues "const"!)
  await ersteKarte.click();
  await expect(ersteKarte).not.toHaveCSS('background-image', /data:image\/svg\+xml/, { timeout: 5000 });

  // STEP 5b: Zweite Karte anklicken, um den Zug komplett zu machen
  const zweiteKarte = alleKarten.nth(1);
  await zweiteKarte.click();
  await expect(zweiteKarte).not.toHaveCSS('background-image', /data:image\/svg\+xml/, { timeout: 5000 });

  // STEP 6: FUNKTIONALER LOGIK-CHECK (Züge springen nun von 0 auf 1 hoch)
  await expect(page.getByText('Züge 1')).toBeVisible({ timeout: 5000 });

  console.log('🎉 Komplette User Journey für Level 1 erfolgreich automatisiert! Der Züge-Zähler reagiert perfekt nach 2 Klicks.');
});
