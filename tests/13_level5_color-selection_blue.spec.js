const { test, expect } = require('@playwright/test');

test('Memory-Spiel: Farbauswahl "Blau" in Level 5 validieren und bis zum Sieg spielen', async ({ page }) => {
  // Erhöhtes Timeout für das vollständige Durchspielen von 96 Paaren
  test.setTimeout(120_000);

  // STEP 1: Seite aufrufen
  await page.goto('https://qa-ui-automation.blogspot.com/p/color-pairs-5-level-game.html');

  // KONTROLLE DER UHR VON ANFANG AN: Fängt alle späteren asynchronen Timer perfekt ab
  await page.clock.install();

  // STEP 2: Intro überspringen
  const startButton = page.locator('#intro-screen button');
  await startButton.click();
  // Uhr kurz vorwärts bewegen für die Schließ-Animation
  await page.clock.fastForward(500);

  // Cookie-Banner abfangen
  const cookieButton = page.locator('#cookieChoiceDismiss');
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
    await page.clock.fastForward(500);
  }

  // STEP 3: Zuerst Level 5 starten
  const level5Button = page.locator('button:has-text("Level 5")');
  await level5Button.click();
  await page.clock.fastForward(500); // Gibt dem Level-Laden Zeit im Zeitraffer

  const alleKarten = page.locator('.card');
  await expect(alleKarten).toHaveCount(192, { timeout: 5000 });
  const farbeVorWechsel = await alleKarten.first().getAttribute('data-color');

  // STEP 4: JETZT DIE BLAUE FARBAUSWAHL TREFFEN (Index 4)
  const blauRadioInput = page.locator('.color-selector-box input[type="radio"]').nth(4);
  await blauRadioInput.click();
  console.log('🔵 Blaues Farbschema angeklickt.');

  // Die Uhr kontrolliert vorspulen, damit das Spiel das neue Spielfeld sofort generiert!
  await page.clock.fastForward(1000);

  // Validierung, dass das Spielfeld umgerendert wurde
  const aktuelleFarbe = await alleKarten.first().getAttribute('data-color');
  expect(aktuelleFarbe).not.toBe(farbeVorWechsel);
  console.log('🔄 Spielfeld wurde erfolgreich auf Blau umgerendert.');

  // STEP 5: Alle 192 neuen Karten-Attribute im Browser auslesen
  const kartenDaten = await alleKarten.evaluateAll(karten =>
    karten.map(k => ({
      label: k.getAttribute('data-pair-label'),
      farbe: k.getAttribute('data-color')
    }))
  );

  // Die exakte originale blaue Farbliste aus Deinem Quellcode
  const erlaubteBlaueHexFarben = [
    '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e',
    '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'
  ];

  let paare = {};
  let alleFarben = new Set();

  // STEP 6: Blau-Validierung für Hex und HSL
  kartenDaten.forEach((karte, index) => {
    const farbe = karte.farbe;
    expect(farbe).not.toBeNull();
    alleFarben.add(farbe);

    if (!paare[karte.label]) { paare[karte.label] = []; }
    paare[karte.label].push(index);

    const normalisierteFarbe = farbe.toLowerCase().trim();
    let istGueltigesBlau = false;

    if (normalisierteFarbe.startsWith('#')) {
      if (erlaubteBlaueHexFarben.includes(normalisierteFarbe)) {
        istGueltigesBlau = true;
      }
    } else if (normalisierteFarbe.startsWith('hsl')) {
      const hueWert = parseInt(normalisierteFarbe.match(/\d+/), 10);
      
      // Blau/Cyan liegt im HSL-Farbkreis stabil zwischen 170 und 255 Grad
      if (hueWert >= 170 && hueWert <= 255) {
        istGueltigesBlau = true;
      }
    }

    expect(istGueltigesBlau, `❌ Fehler an Karten-Index ${index}: Die Farbe ${farbe} ist kein gültiger Blau- oder Cyanton!`).toBe(true);
  });

  console.log(`✅ QA-Check bestanden: Alle Karten sind valide Blautöne. Löse das Feld...`);

  // STEP 7: Die gemerkten Paare nacheinander einklicken
  let gefundeneKarten = 0;
  for (const label in paare) {
    const indexKarte1 = paare[label][0]; 
    const indexKarte2 = paare[label][1]; 

    await alleKarten.nth(indexKarte1).click();
    await alleKarten.nth(indexKarte2).click();

    // Spult die Klick-Animationen (600ms) verzögerungsfrei vor
    await page.clock.fastForward(600);
    gefundeneKarten += 2;

    await expect(page.locator('.card.matched')).toHaveCount(gefundeneKarten, { timeout: 5000 });
  }

  // Sieg-Modal-Animation abwarten
  await page.clock.fastForward(500);

  // STEP 8: End-Assertions für den geschafften Sieg
  await expect(page.locator('.card.matched')).toHaveCount(kartenDaten.length, { timeout: 5000 });
  await expect(page.locator('#progress-text')).toHaveText('96 / 96 Paare', { timeout: 5000 });

  const erfolgsDialog = page.locator('#success-modal');
  await expect(erfolgsDialog).toHaveClass(/active/, { timeout: 5000 });
  
  console.log('🎉 Sensationell! Das blaue Level 5 läuft im Turbomodus fehlerfrei durch!');
});
