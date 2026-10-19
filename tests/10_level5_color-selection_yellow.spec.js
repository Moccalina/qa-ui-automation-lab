const { test, expect } = require('@playwright/test');

test('Memory-Spiel: Farbauswahl "Gelb/Orange" in Level 5 validieren und bis zum Sieg spielen', async ({ page }) => {
  test.setTimeout(120_000);

  // STEP 1: Seite aufrufen
  await page.goto('https://qa-ui-automation.blogspot.com/p/color-pairs-5-level-game.html');

  // KONTROLLE VON ANFANG AN: Fängt alle späteren asynchronen Timer perfekt ab
  await page.clock.install();

  // STEP 2: Intro überspringen
  const startButton = page.locator('#intro-screen button');
  await startButton.click();
  // Uhr kurz vorwärts bewegen, falls das Intro eine Schließ-Animation hat
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

  // STEP 4: JETZT DIE GELB/ORANGE FARBAUSWAHL TREFFEN (Index 1)
  const gelbRadioInput = page.locator('.color-selector-box input[type="radio"]').nth(1);
  await gelbRadioInput.click();
  console.log('🟡 Gelb-oranges Farbschema angeklickt.');

  // Die Uhr kontrolliert vorspulen, damit das Spiel das neue Spielfeld sofort generiert!
  await page.clock.fastForward(1000);

  // Validierung, dass das Spielfeld umgerendert wurde
  const aktuelleFarbe = await alleKarten.first().getAttribute('data-color');
  expect(aktuelleFarbe).not.toBe(farbeVorWechsel);
  console.log('🔄 Spielfeld wurde erfolgreich auf Gelb/Orange umgerendert.');

  // STEP 5: Alle 192 neuen Karten-Attribute im Browser auslesen
  const kartenDaten = await alleKarten.evaluateAll(karten =>
    karten.map(k => ({
      label: k.getAttribute('data-pair-label'),
      farbe: k.getAttribute('data-color')
    }))
  );

  // Die exakte originale gelb-orange Farbliste
  const erlaubteGelbeHexFarben = [
    '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
    '#fff7ed', '#ffedd5', '#fed7aa', '#fdbb74', '#fda4af', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'
  ];

  let paare = {};
  let alleFarben = new Set();

  // STEP 6: Gelb-Validierung für Hex und HSL
  kartenDaten.forEach((karte, index) => {
    const farbe = karte.farbe;
    expect(farbe).not.toBeNull();
    alleFarben.add(farbe);

    if (!paare[karte.label]) { paare[karte.label] = []; }
    paare[karte.label].push(index);

    const normalisierteFarbe = farbe.toLowerCase().trim();
    let istGueltigesGelbOrange = false;

    if (normalisierteFarbe.startsWith('#')) {
      if (erlaubteGelbeHexFarben.includes(normalisierteFarbe)) {
        istGueltigesGelbOrange = true;
      }
    } else if (normalisierteFarbe.startsWith('hsl')) {
      const hueWert = parseInt(normalisierteFarbe.match(/\d+/), 10);
      if (hueWert >= 10 && hueWert <= 75) {
        istGueltigesGelbOrange = true;
      }
    }

    expect(istGueltigesGelbOrange, `❌ Fehler an Karten-Index ${index}: Die Farbe ${farbe} ist kein gültiger Gelb- oder Orangeton!`).toBe(true);
  });

  console.log(`✅ QA-Check bestanden: Alle Karten sind valide Gelb-/Orangetöne. Löse das Feld...`);

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
  
  console.log('🎉 Sensationell! Gelb/Orange läuft mit der optimierten Reihenfolge fliegend durch!');
});
