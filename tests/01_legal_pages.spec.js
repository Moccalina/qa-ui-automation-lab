const { test, expect } = require('@playwright/test');

test.describe('Rechtliche Pflichtseiten (Footer & Navigation)', () => {

  test('Impressum: Link im Footer sichtbar, anklickbar und Inhalt vorhanden', async ({ page }) => {
    await page.goto('./');

    // 1. Link auf der Startseite prüfen
    const impressumLink = page.getByRole('link', { name: /Impressum/i });
    await expect(impressumLink).toBeVisible();

    // 2. Link anklicken und Ziel-URL prüfen
    await impressumLink.click();
    await expect(page).toHaveURL(/impressum\.html$/);

    // 3. Überschrift und echten Textinhalt prüfen
    await expect(page.locator('h1')).toContainText(/Impressum/i);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(80);

    // 4. Zurück-Link prüfen
    const backLink = page.getByRole('link', { name: /Zurück/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/color-pairs-game\/(index\.html)?$/);
  });

  test('Datenschutz: Link im Footer sichtbar, anklickbar und Inhalt vorhanden', async ({ page }) => {
    await page.goto('./');

    // 1. Link auf der Startseite prüfen
    const datenschutzLink = page.getByRole('link', { name: /Datenschutz/i });
    await expect(datenschutzLink).toBeVisible();

    // 2. Link anklicken und Ziel-URL prüfen
    await datenschutzLink.click();
    await expect(page).toHaveURL(/datenschutz\.html$/);

    // 3. Überschrift und echten Textinhalt prüfen
    await expect(page.locator('h1')).toContainText(/Datenschutz/i);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(150);

    // 4. Zurück-Link prüfen
    const backLink = page.getByRole('link', { name: /Zurück/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/color-pairs-game\/(index\.html)?$/);
  });

});
