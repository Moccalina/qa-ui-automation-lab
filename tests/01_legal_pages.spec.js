const { test, expect } = require('@playwright/test');

test.describe('Rechtliche Pflichtseiten (Footer & Navigation)', () => {

  async function openMainScreen(page) {
    await page.goto('./');
    // Falls das Start-Intro-Overlay angezeigt wird, dieses zuerst schließen
    const introButton = page.locator('#intro-overlay button, #start-intro-btn, .intro-modal button').first();
    if (await introButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await introButton.click();
    }
  }

  test('Impressum: Link im Footer sichtbar, anklickbar und Inhalt vorhanden', async ({ page }) => {
    await openMainScreen(page);

    const impressumLink = page.locator('a[href*="impressum"]').first();
    await impressumLink.scrollIntoViewIfNeeded();
    await expect(impressumLink).toBeVisible();

    await impressumLink.click();
    await expect(page).toHaveURL(/impressum\.html$/);
    await expect(page.locator('h1')).toContainText(/Impressum/i);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(80);

    const backLink = page.locator('a').first();
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/color-pairs-game\/(index\.html)?$/);
  });

  test('Datenschutz: Link im Footer sichtbar, anklickbar und Inhalt vorhanden', async ({ page }) => {
    await openMainScreen(page);

    const datenschutzLink = page.locator('a[href*="datenschutz"]').first();
    await datenschutzLink.scrollIntoViewIfNeeded();
    await expect(datenschutzLink).toBeVisible();

    await datenschutzLink.click();
    await expect(page).toHaveURL(/datenschutz\.html$/);
    await expect(page.locator('h1')).toContainText(/Datenschutz/i);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(150);

    const backLink = page.locator('a').first();
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/color-pairs-game\/(index\.html)?$/);
  });

});
