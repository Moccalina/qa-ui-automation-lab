const { test, expect } = require('@playwright/test');

test('Memory-Spiel: Vollständige Level 4 User Journey bis zum Sieg', async ({ page }) => {
  test.setTimeout(70_000);
  
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

  // STEP 3: Level 4 aktivieren und prüfen, ob das Spiel lädt
  const level4Button = page.locator('button:has-text("Level 4")');
  await level4Button.click();
  
  const zuegeAnzeige = page.locator('span.mini-label:has-text("Züge")');
  await expect(zuegeAnzeige).toBeVisible({ timeout: 5000 });

  // STEP 4: Struktur der Karten & Pfoten-Rückseite prüfen
  const alleKarten = page.locator('.card');
  await expect(alleKarten).toHaveCount(152, { timeout: 8000 });
  
  const ersteKarte = alleKarten.first();
  await expect(ersteKarte).toHaveCSS('background-color', 'rgb(55, 65, 81)', { timeout: 5000 });
  await expect(ersteKarte).toHaveCSS('background-image', /data:image\/svg\+xml/, { timeout: 5000 });

  // ==========================================
  // WIR LÖSEN JETZT ALLE PAARE!
  // ==========================================
  const anzahlKarten = await alleKarten.count();
  
  // PERFORMANCE-BOOST: Alle Karten-Attribute auf einen Schlag im Browser auslesen
  // Das verhindert 152 langsame, sequentielle Einzelabfragen über das Netzwerk.
  const kartenDaten = await alleKarten.evaluateAll(karten =>
    karten.map(k => ({
      label: k.getAttribute('data-pair-label'),
      farbe: k.getAttribute('data-color')
    }))
  );

  const paare = {};
  let alleFarben = new Set();

  // Daten im Test-Skript verarbeiten und Paare zuordnen
  kartenDaten.forEach((karte, index) => {
    alleFarben.add(karte.farbe);
    if (!paare[karte.label]) {
      paare[karte.label] = [];
    }
    paare[karte.label].push(index); // Wir merken uns die Index-Positionen
  });

  // QA-Check: Einzigartigkeit der Farben prüfen (152 / 2 = 76 Paare)
  const erwarteteEinzigartigePaare = anzahlKarten / 2;
  expect(alleFarben.size).toBe(erwarteteEinzigartigePaare);
  expect(Object.keys(paare)).toHaveLength(erwarteteEinzigartigePaare);
  for (const [label, kartenIndizes] of Object.entries(paare)) {
    expect(kartenIndizes, `Paar ${label} muss aus genau zwei Karten bestehen`).toHaveLength(2);
    expect(kartenDaten[kartenIndizes[0]].farbe).toBe(kartenDaten[kartenIndizes[1]].farbe);
  }
  console.log(`✅ QA-Check bestanden: Es gibt exakt ${alleFarben.size} verschiedene Kartenpaare.`);

  // Die Spiel-Logik wartet 600 ms pro Paar. Die Browser-Uhr lässt diese Timer
  // kontrolliert ablaufen, ohne pro Paar echte Zeit zu verlieren.
  await page.clock.install();

  // 2. Jetzt klicken wir die gemerkten Paare nacheinander an
  console.log('🚀 Starte Klick-Journey...');
  let gefundeneKarten = 0;
  for (const label in paare) {
    const indexKarte1 = paare[label][0];
    const indexKarte2 = paare[label][1];

    await alleKarten.nth(indexKarte1).click();
    await alleKarten.nth(indexKarte2).click();

    await page.clock.fastForward(600);
    gefundeneKarten += 2;
    await expect(page.locator('.card.matched')).toHaveCount(gefundeneKarten, { timeout: 5000 });
    await expect(page.locator('#progress-text')).toHaveText(
      `${gefundeneKarten / 2} / ${erwarteteEinzigartigePaare} Paare`,
      { timeout: 5000 }
    );
  }

  // Das Spiel zeigt den Siegdialog 500 ms nach dem letzten gefundenen Paar an.
  await page.clock.fastForward(500);

  // STEP 5: Auf abgeschlossenen Fortschritt und die vollständig angezeigte Siegbestätigung warten
  await expect(page.locator('.card.matched')).toHaveCount(anzahlKarten, { timeout: 5000 });
  await expect(page.locator('#progress-text')).toHaveText('76 / 76 Paare', { timeout: 5000 });

  const erfolgsDialog = page.locator('#success-modal');
  await expect(erfolgsDialog).toHaveClass(/active/, { timeout: 5000 });
  await expect(erfolgsDialog).toHaveCSS('opacity', '1', { timeout: 5000 });
  const erfolgsMeldung = page.locator('#modal-message');
  await expect(erfolgsMeldung).toContainText('gelöst');
  await expect(erfolgsMeldung).toContainText(/\d+ Zügen/);
  await expect(page.locator('#modal-close-btn')).toBeVisible();

  // Die Assertions sind das Testende. Der Dialog bleibt sichtbar; kein Buttonklick oder Nachlauf-Wait.
  console.log('🎉 Sensationell! Das komplette Spielfeld wurde fehlerfrei abgeräumt und verifiziert!');
});
