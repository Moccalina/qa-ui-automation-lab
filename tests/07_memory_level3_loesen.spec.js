const { test, expect } = require('@playwright/test');

test('Memory-Spiel: Vollständige Level 3 User Journey bis zum Sieg', async ({ page }) => {
  test.setTimeout(120_000);
  
  // STEP 1: Seite aufrufen
  await page.goto('https://qa-ui-automation.blogspot.com/p/color-pairs-5-level-game.html');

  // STEP 2: Intro überspringen (Da dies die oberste Ebene ist, klappt der Klick sofort!)
  const startButton = page.locator('#intro-screen button');
  await startButton.click();
  console.log('✅ Intro-Screen erfolgreich geschlossen.');

  // ==========================================
  // COOKIE-BANNER ERST JETZT ABFANGEN (Wenn das Intro weg ist!)
  // ==========================================
  const cookieButton = page.locator('#cookieChoiceDismiss');
  
  // Wir geben dem Google-Banner nach dem Intro kurz Zeit, sich zu zeigen
  try {
    await cookieButton.waitFor({ state: 'visible', timeout: 2000 });
  } catch (e) {
    console.log('ℹ️ Cookie-Banner nach dem Intro nicht aufgetaucht.');
  }

  // Wenn es jetzt da ist, klicken wir es weg – die Schusslinie ist nun frei!
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
    await expect(cookieButton).toBeHidden({ timeout: 3000 });
    console.log('🎉 Cookie-Banner erfolgreich nach dem Intro ausgeblendet.');
  }

  // STEP 3: Level 3 aktivieren und prüfen, ob das Spiel lädt
  const level3Button = page.locator('button:has-text("Level 3")');
  await level3Button.click();
  
  const zuegeAnzeige = page.locator('span.mini-label:has-text("Züge")');
  await expect(zuegeAnzeige).toBeVisible({ timeout: 5000 });

  // STEP 4: Struktur der Karten & Pfoten-Rückseite prüfen
  const alleKarten = page.locator('.card');
  await expect(alleKarten).toHaveCount(96, { timeout: 8000 });
  
  const ersteKarte = alleKarten.first();
  await expect(ersteKarte).toHaveCSS('background-color', 'rgb(55, 65, 81)', { timeout: 5000 });
  await expect(ersteKarte).toHaveCSS('background-image', /data:image\/svg\+xml/, { timeout: 5000 });

  // ==========================================
  // WIR LÖSEN JETZT ALLE PAARE!
  // ==========================================
  const anzahlKarten = await alleKarten.count();
  
  // 1. Wir lesen die Paare im ruhigen Zustand aus
  let paare = {};
  let alleFarben = new Set();

  for (let i = 0; i < anzahlKarten; i++) {
    const label = await alleKarten.nth(i).getAttribute('data-pair-label');
    const farbe = await alleKarten.nth(i).getAttribute('data-color');
    alleFarben.add(farbe);

    if (!paare[label]) {
      paare[label] = [];
    }
    paare[label].push(i); // Wir merken uns die Index-Positionen
  }

  // QA-Check: Einzigartigkeit der Farben prüfen
  const erwarteteEinzigartigePaare = anzahlKarten / 2; // 96 / 2 = 48
  expect(alleFarben.size).toBe(erwarteteEinzigartigePaare);
  console.log(`✅ QA-Check bestanden: Es gibt exakt ${alleFarben.size} verschiedene Kartenpaare.`);

  // 2. Jetzt klacken wir die gemerkten Paare nacheinander ein
  console.log('🚀 Starte Klick-Journey...');
  for (const label in paare) {
    const indexKarte1 = paare[label][0]; // Die erste Zahl aus der Liste
    const indexKarte2 = paare[label][1]; // Die zweite Zahl aus der Liste

    await alleKarten.nth(indexKarte1).click();
    await alleKarten.nth(indexKarte2).click();

    // Kritischer Punkt: 0,8 Sekunden Pause, damit die Blog-Animation flüssig hinterherkommt
    // Pause in JEDER Runde. Anzahl der Paare * waitForTimeout Zeit summieren sich. Wenn diese Pause entfernt oder verkürzt wird, läuft der Test schneller – vorausgesetzt, die Spielanimationen kommen damit zurecht
    await page.waitForTimeout(800);
  }

  // STEP 5: FUNKTIONALER LOGIK-CHECK (Am Ende müssen 24 Paare gefunden sein)
  await expect(page.getByText('48 / 48 Paare')).toBeVisible({ timeout: 5000 });

  console.log('🎉 Sensationell! Das komplette Spielfeld wurde fehlerfrei abgeräumt und verifiziert!');
});
