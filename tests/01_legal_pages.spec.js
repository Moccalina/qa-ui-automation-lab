const { test, expect } = require('@playwright/test');

test.describe('Rechtliche Pflichtseiten (Footer & Navigation)', () => {

  async function openStartMenu(page) {
    await page.goto('./');
    const introBtn = page.locator('#intro-start-btn');
    if (await introBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await introBtn.click();
    }
  }

  test('Impressum: Link im Footer sichtbar, anklickbar und Inhalt vorhanden', async ({ page }) => {
    await openStartMenu(page);

    const impressumLink = page.locator('a[href*="impressum"]');
    await impressumLink.scrollIntoViewIfNeeded();
    await expect(impressumLink).toBeVisible();

    await impressumLink.click();
    await expect(page).toHaveURL(/impressum\.html$/);
    await expect(page.locator('h1')).toContainText(/Impressum/i);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(80);

    const backLink = page.locator('a').first();
    await backLink.click();
    await expect(page).toHaveURL(/\/color-pairs-game\/(index\.html)?$/);
  });

  test('Datenschutz: Link im Footer sichtbar, anklickbar und Inhalt vorhanden', async ({ page }) => {
    await openStartMenu(page);

    const datenschutzLink = page.locator('a[href*="datenschutz"]');
    await datenschutzLink.scrollIntoViewIfNeeded();
    await expect(datenschutzLink).toBeVisible();

    await datenschutzLink.click();
    await expect(page).toHaveURL(/datenschutz\.html$/);
    await expect(page.locator('h1')).toContainText(/Datenschutz/i);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(150);

    const backLink = page.locator('a').first();
    await backLink.click();
    await expect(page).toHaveURL(/\/color-pairs-game\/(index\.html)?$/);
  });

});
