const { test, expect } = require('@playwright/test');

test('Memory-Spiel: Farbauswahl "Grün" nach Level-Start validieren und bis zum Sieg spielen', async ({ page }) => {
  test.setTimeout(120_000);

  // STEP 1: Seite aufrufen
  await page.goto('https://qa-ui-automation.blogspot.com/p/color-pairs-5-level-game.html');

  // STEP 2: Intro überspringen
  const startButton = page.locator('#intro-screen button');
  await startButton.click();

  // Cookie-Banner abfangen
  const cookieButton = page.locator('#cookieChoiceDismiss');
  try { await cookieButton.waitFor({ state: 'visible', timeout: 2000 }); } catch (e) {}
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
    await expect(cookieButton).toBeHidden({ timeout: 3000 });
  }

  // STEP 3: Zuerst Level 5 starten
  const level5Button = page.locator('button:has-text("Level 5")');
  await level5Button.click();
  await expect(page.locator('span.mini-label:has-text("Züge")')).toBeVisible({ timeout: 5000 });

  const alleKarten = page.locator('.card');
  await expect(alleKarten).toHaveCount(192, { timeout: 8000 });
  const farbeVorWechsel = await alleKarten.first().getAttribute('data-color');

  // STEP 4: JETZT DIE GRÜNE FARBAUSWAHL TREFFEN (Index 5 wie auf dem Screenshot entdeckt!)
  const gruenRadioInput = page.locator('.color-selector-box input[type="radio"]').nth(5);
  await gruenRadioInput.click();
  console.log('🟢 Grünes Farbschema angeklickt.');

  // Warten auf das Umschalten des Spielfelds
  await expect(async () => {
    const aktuelleFarbe = await alleKarten.first().getAttribute('data-color');
    expect(aktuelleFarbe).not.toBe(farbeVorWechsel);
  }).toPass({ timeout: 3000 });
  console.log('🔄 Spielfeld wurde erfolgreich auf Grün umgerendert.');

  // STEP 5: Alle 192 neuen Karten-Attribute im Browser auslesen
  const kartenDaten = await alleKarten.evaluateAll(karten =>
    karten.map(k => ({
      label: k.getAttribute('data-pair-label'),
      farbe: k.getAttribute('data-color')
    }))
  );

  // Die exakte originale grüne Farbliste aus dem Quellcode
  const erlaubteGrueneHexFarben = [
    '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
    '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'
  ];

  let paare = {};
  let alleFarben = new Set();

  // STEP 6: Mathematische Grün-Validierung für Hex und HSL
  kartenDaten.forEach((karte, index) => {
    const farbe = karte.farbe;
    expect(farbe).not.toBeNull();
    alleFarben.add(farbe);

    if (!paare[karte.label]) { paare[karte.label] = []; }
    paare[karte.label].push(index);

    const normalisierteFarbe = farbe.toLowerCase().trim();
    let istGueltigesGruen = false;

    if (normalisierteFarbe.startsWith('#')) {
      if (erlaubteGrueneHexFarben.includes(normalisierteFarbe)) {
        istGueltigesGruen = true;
      }
    } else if (normalisierteFarbe.startsWith('hsl')) {
      const hueWert = parseInt(normalisierteFarbe.match(/\d+/), 10);
      
      // Grün liegt im HSL-Farbkreis stabil zwischen 75 und 165 Grad (Dein Wert 147 passt perfekt hier rein!)
      if (hueWert >= 75 && hueWert <= 165) {
        istGueltigesGruen = true;
      }
    }

    expect(istGueltigesGruen, `❌ Fehler an Karten-Index ${index}: Die Farbe ${farbe} ist kein gültiger Grünton!`).toBe(true);
  });

  console.log(`✅ QA-Check bestanden: Alle Karten sind valide Grüntöne. Löse das Feld...`);

  // Browser-Uhr installieren und abräumen
  await page.clock.install();

  let gefundeneKarten = 0;
  for (const label in paare) {
    const indexKarte1 = paare[label][0];
    const indexKarte2 = paare[label][1];

    await alleKarten.nth(indexKarte1).click();
    await alleKarten.nth(indexKarte2).click();

    await page.clock.fastForward(600);
    gefundeneKarten += 2;
    await expect(page.locator('.card.matched')).toHaveCount(gefundeneKarten, { timeout: 5000 });
  }

  await page.clock.fastForward(500);
  await expect(page.locator('#success-modal')).toHaveClass(/active/, { timeout: 5000 });
  console.log('🎉 Sensationell! Das grüne Farbschema läuft fehlerfrei durch.');
});
