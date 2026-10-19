const { test, expect } = require('@playwright/test');

test('Memory-Spiel: Farbauswahl "Grau" nach Level-Start validieren und bis zum Sieg spielen', async ({ page }) => {
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

  // STEP 3: MEIN WEG – Zuerst Level 5 starten
  const level5Button = page.locator('button:has-text("Level 5")');
  await level5Button.click();
  
  const zuegeAnzeige = page.locator('span.mini-label:has-text("Züge")');
  await expect(zuegeAnzeige).toBeVisible({ timeout: 5000 });
  console.log('🎮 Level 5 erfolgreich gestartet.');

  // Wir merken uns die Farbe der ersten Karte im Standard-Modus, um zu wissen, wann die Umschaltung fertig ist
  const alleKarten = page.locator('.card');
  await expect(alleKarten).toHaveCount(192, { timeout: 8000 });
  const farbeVorWechsel = await alleKarten.first().getAttribute('data-color');

  // STEP 4: MEIN WEG – Jetzt die graue Farbauswahl treffen
  const grauRadioInput = page.locator('.color-selector-box input[type="radio"]').nth(6);
  await grauRadioInput.click();
  console.log('⚫ Graues Farbschema angeklickt.');

  // ASYNCHRONITÄT ABFANGEN: Wir warten aktiv darauf, dass sich das Spielfeld visuell aktualisiert.
  // Der Test pausiert, bis die erste Karte nicht mehr die alte Farbe hat.
  await expect(async () => {
    const aktuelleFarbe = await alleKarten.first().getAttribute('data-color');
    expect(aktuelleFarbe).not.toBe(farbeVorWechsel);
  }).toPass({ timeout: 3000 });
  console.log('🔄 Spielfeld wurde erfolgreich auf Grau umgerendert.');

  // STEP 5: Alle 192 neuen Karten-Attribute im Browser auslesen
  const kartenDaten = await alleKarten.evaluateAll(karten =>
    karten.map(k => ({
      label: k.getAttribute('data-pair-label'),
      farbe: k.getAttribute('data-color')
    }))
  );

  console.log(`🔍 Analysiere die echten Grautöne von allen ${kartenDaten.length} Karten...`);

  // Die exakte originale graue Farbliste aus dem Tailwind-Code
  const erlaubteGraueHexFarben = [
    '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a',
    '#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'
  ];

  let paare = {};
  let alleFarben = new Set();

  // STEP 6: Mathematische Grau-Validierung für Hex und HSL
  kartenDaten.forEach((karte, index) => {
    const farbe = karte.farbe;
    expect(farbe).not.toBeNull();
    alleFarben.add(farbe);

    if (!paare[karte.label]) {
      paare[karte.label] = [];
    }
    paare[karte.label].push(index);

    const normalisierteFarbe = farbe.toLowerCase().trim();
    let istGueltigesGrau = false;

    if (normalisierteFarbe.startsWith('#')) {
      if (erlaubteGraueHexFarben.includes(normalisierteFarbe)) {
        istGueltigesGrau = true;
      }
    } else if (normalisierteFarbe.startsWith('hsl')) {
      const hslZahlen = normalisierteFarbe.match(/\d+/g).map(Number);
      if (hslZahlen && hslZahlen.length >= 2) {
        const saettigung = hslZahlen[1]; // Sättigung in %
        
        // Valide Grautöne im HSL-Raum haben eine Sättigung von unter 15%
        if (saettigung <= 15) {
          istGueltigesGrau = true;
        }
      }
    }

    expect(istGueltigesGrau, `❌ Fehler an Karten-Index ${index}: Die Farbe ${farbe} ist kein gültiger Grauton!`).toBe(true);
  });

  console.log(`✅ QA-Check bestanden: Alle 192 Karten sind echte Grautöne. Installiere Uhr für Klick-Journey...`);

  // Browser-Uhr installieren, um die Klicks im Turbomodus abzufeuern
  await page.clock.install();

  // STEP 7: Die gemerkten grauen Paare nacheinander einklicken
  let gefundeneKarten = 0;
  for (const label in paare) {
    const indexKarte1 = paare[label][0];
    const indexKarte2 = paare[label][1];

    await alleKarten.nth(indexKarte1).click();
    await alleKarten.nth(indexKarte2).click();

    // UI-Animation (600ms) vorspulen
    await page.clock.fastForward(600);
    gefundeneKarten += 2;

    await expect(page.locator('.card.matched')).toHaveCount(gefundeneKarten, { timeout: 5000 });
  }

  // Sieg-Modal-Animation abwarten (500ms)
  await page.clock.fastForward(500);

  // STEP 8: End-Assertions für den geschafften Grau-Sieg
  await expect(page.locator('.card.matched')).toHaveCount(kartenDaten.length, { timeout: 5000 });
  await expect(page.locator('#progress-text')).toHaveText('96 / 96 Paare', { timeout: 5000 });

  const erfolgsDialog = page.locator('#success-modal');
  await expect(erfolgsDialog).toHaveClass(/active/, { timeout: 5000 });
  await expect(page.locator('#modal-message')).toContainText('gelöst');
  
  console.log('🎉 Sensationell! Die User Journey funktioniert perfekt. Level 5 wurde im grauen "Königs"-Modus fehlerfrei bezwungen!');
});
