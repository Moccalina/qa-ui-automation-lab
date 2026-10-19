const { test, expect } = require('@playwright/test');

test('Memory-Spiel: Farbauswahl "Rot" in Level 5 validieren und bis zum Sieg spielen', async ({ page }) => {
  // Erhöhtes Timeout für das vollständige Durchspielen
  test.setTimeout(120_000);

  // STEP 1: Seite aufrufen
  await page.goto('https://qa-ui-automation.blogspot.com/p/color-pairs-5-level-game.html');

  // STEP 2: Intro überspringen
  const startButton = page.locator('#intro-screen button');
  await startButton.click();
  console.log('✅ Intro-Screen erfolgreich geschlossen.');

  // Cookie-Banner abfangen
  const cookieButton = page.locator('#cookieChoiceDismiss');
  try {
    await cookieButton.waitFor({ state: 'visible', timeout: 2000 });
  } catch (e) {
    console.log('ℹ️ Cookie-Banner nach dem Intro nicht aufgetaucht.');
  }

  if (await cookieButton.isVisible()) {
    await cookieButton.click();
    await expect(cookieButton).toBeHidden({ timeout: 3000 });
    console.log('🎉 Cookie-Banner erfolgreich ausgeblendet.');
  }

  // STEP 3: Zuerst das gewünschte Level aktivieren (Level 5)
  const level5Button = page.locator('button:has-text("Level 5")');
  await level5Button.click();
  
  const zuegeAnzeige = page.locator('span.mini-label:has-text("Züge")');
  await expect(zuegeAnzeige).toBeVisible({ timeout: 5000 });
  console.log('🎮 Level 5 erfolgreich gestartet.');

  // STEP 4: Jetzt das rote Farbschema über den Radio-Button auswählen
  const rotRadioInput = page.locator('.color-selector-box input[type="radio"]').nth(2); 
  await rotRadioInput.click();
  console.log('🔴 Rotes Farbschema ausgewählt.');

  // STEP 5: Alle Karten-Strukturen blitzschnell im Browser auslesen
  const alleKarten = page.locator('.card');
  await expect(alleKarten).toHaveCount(192, { timeout: 8000 });

  const kartenDaten = await alleKarten.evaluateAll(karten =>
    karten.map(k => ({
      label: k.getAttribute('data-pair-label'),
      farbe: k.getAttribute('data-color')
    }))
  );

  console.log(`🔍 Analysiere die Farben von allen ${kartenDaten.length} generierten Karten in Level 5...`);

  // Statische originale rote Farbliste
  const erlaubteRoteHexFarben = [
    '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
    '#fff5f5', '#fed7d7', '#feb2b2', '#fc8181', '#f56565', '#e53e3e', '#c53030', '#9b2c2c', '#742a2a', '#5c2525'
  ];

  // Paare-Zuordnung für die Klick-Journey vorbereiten
  let paare = {};
  let alleFarben = new Set();

  // STEP 6: Intelligente Prüfung gegen Hex und HSL-Farbräume
  kartenDaten.forEach((karte, index) => {
    const farbe = karte.farbe;
    expect(farbe).not.toBeNull();
    alleFarben.add(farbe);

    if (!paare[karte.label]) {
      paare[karte.label] = [];
    }
    paare[karte.label].push(index);

    const normalisierteFarbe = farbe.toLowerCase().trim();
    let istGueltigesRot = false;

    if (normalisierteFarbe.startsWith('#')) {
      // Check gegen die statische Tailwind-Palette
      if (erlaubteRoteHexFarben.includes(normalisierteFarbe)) {
        istGueltigesRot = true;
      }
    } else if (normalisierteFarbe.startsWith('hsl')) {
      // Extrahiere den ersten Zahlenwert (den Farbton/Hue) aus z.B. hsl(11, 80%, 59%)
      const hueWert = parseInt(normalisierteFarbe.match(/\d+/)[0], 10);
      
      // Rot liegt auf dem Farbkreis ganz am Anfang (0-20 Grad) oder ganz am Ende (340-360 Grad)
      if (hueWert <= 25 || hueWert >= 335) {
        istGueltigesRot = true;
      }
    }

    expect(istGueltigesRot, `❌ Fehler an Karten-Index ${index}: Die Farbe ${farbe} ist kein gültiges Rot im Hex- oder HSL-Farbkreis!`).toBe(true);
  });

  const erwarteteEinzigartigePaare = kartenDaten.length / 2; // 96
  console.log(`✅ QA-Check bestanden: Alle ${kartenDaten.length} Karten gehören zum roten Farbschema. Starte Klick-Lösung...`);

  // Browser-Uhr für das turboschnelle Klicken installieren
  await page.clock.install();

  // STEP 7: Die gemerkten roten Paare nacheinander einklicken
  let gefundeneKarten = 0;
  for (const label in paare) {
    const indexKarte1 = paare[label][0];
    const indexKarte2 = paare[label][1];

    await alleKarten.nth(indexKarte1).click();
    await alleKarten.nth(indexKarte2).click();

    // Spult die 600ms UI-Animation des Spiels sofort vor
    await page.clock.fastForward(600);
    gefundeneKarten += 2;

    // Laufende Validierung während des Lösens
    await expect(page.locator('.card.matched')).toHaveCount(gefundeneKarten, { timeout: 5000 });
  }

  // Sieg-Modal-Animation abwarten (500ms)
  await page.clock.fastForward(500);

  // STEP 8: End-Assertions für den glorreichen roten Level 5 Sieg prüfen
  await expect(page.locator('.card.matched')).toHaveCount(kartenDaten.length, { timeout: 5000 });
  await expect(page.locator('#progress-text')).toHaveText('96 / 96 Paare', { timeout: 5000 });

  const erfolgsDialog = page.locator('#success-modal');
  await expect(erfolgsDialog).toHaveClass(/active/, { timeout: 5000 });
  await expect(page.locator('#modal-message')).toContainText('gelöst');
  
  console.log('🎉 Sensationell! Level 5 wurde im roten Design fehlerfrei geprüft, abgeräumt und verifiziert!');
});
