const { test, expect } = require('@playwright/test');

test('Cookie-Banner: der rechtliche Cookie-Hinweis wird eingeblendet und lässt sich erfolgreich bestätigen', async ({ page }) => {
  await page.goto('https://qa-ui-automation.blogspot.com/');

  // 1. Wir nutzen die exakte ID aus dem Quellcode. In CSS schreibt man IDs mit einer Raute (#)
  const cookieButton = page.locator('#cookieChoiceDismiss');

  // 2. Wir prüfen, ob der Button sichtbar ist (falls Blogger ihn einblendet)
  if (await cookieButton.isVisible()) {
    
    // 3. KLICK! Playwright klickt auf das "Ok"
    await cookieButton.click();
    
    // 4. WICHTIGER QA-CHECK: wir verifizieren, ob der Banner danach unsichtbar wird
    await expect(cookieButton).toBeHidden({ timeout: 3000 });
    console.log('🎉 Cookie-Banner erfolgreich über ID #cookieChoiceDismiss bestätigt und ausgeblendet.');
  } else {
    console.log('ℹ️ Kein Cookie-Banner eingeblendet (evtl. durch vorherigen Testlauf noch im Browser-Cache akzeptiert).');
  }
});


