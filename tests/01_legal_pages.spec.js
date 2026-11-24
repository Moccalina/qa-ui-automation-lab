const { test, expect } = require('@playwright/test');

test.describe('Rechtliche Pflichtseiten (Footer & Navigation)', () => {

  test('Impressum: Link im Footer sichtbar, anklickbar und Inhalt vorhanden', async ({ page }) => {
    await page.goto('./');

    // 1. Link im Footer prüfen
    const impressumLink = page.locator('footer.game-footer a', { hasText: 'Impressum' });
    await expect(impressumLink).toBeVisible();

    // 2. Link anklicken und Ziel-URL prüfen
    await impressumLink.click();
    await expect(page).toHaveURL(/impressum\.html$/);

    // 3. Überschrift und echten Textinhalt prüfen
    await expect(page.locator('h1')).toHaveText('Impressum');
    const bodyText = await page.locator('.container').innerText();
    expect(bodyText.length).toBeGreaterThan(50);

    // 4. Zurück-Button prüfen
    const backLink = page.locator('a.back-link');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/(index\.html)?$/);
  });

  test('Datenschutz: Link im Footer sichtbar, anklickbar und Inhalt vorhanden', async ({ page }) => {
    await page.goto('./');

    // 1. Link im Footer prüfen
    const datenschutzLink = page.locator('footer.game-footer a', { hasText: 'Datenschutz' });
    await expect(datenschutzLink).toBeVisible();

    // 2. Link anklicken und Ziel-URL prüfen
    await datenschutzLink.click();
    await expect(page).toHaveURL(/datenschutz\.html$/);

    // 3. Überschrift und echten Textinhalt prüfen
    await expect(page.locator('h1')).toHaveText('Datenschutzerklärung');
    const bodyText = await page.locator('.container').innerText();
    expect(bodyText.length).toBeGreaterThan(150);

    // 4. Zurück-Button prüfen
    const backLink = page.locator('a.back-link');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/(index\.html)?$/);
  });

});
