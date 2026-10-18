const { test, expect } = require('@playwright/test');

test('Datenschutz: Direktaufruf der URL liefert Status 200 OK', async ({ page }) => {
  // 1. Wir rufen die URL auf und fangen die Antwort (Response) des Servers ab
  const response = await page.goto('https://qa-ui-automation.blogspot.com/p/datenschutz.html');

  // 2. Wir prüfen direkt, ob der Server mit dem HTTP-Status 200 (Erfolgreich) antwortet
  expect(response.status()).toBe(200);

  // 3. Zusätzlicher Check: Steht die richtige URL oben in der Adresszeile des Browsers?
  await expect(page).toHaveURL('https://qa-ui-automation.blogspot.com/p/datenschutz.html');
  
  console.log('🎉 Datenschutz-URL erfolgreich verifiziert (Status 200).');
});

test('Impressum: Direktaufruf liefert Status 200 OK und enthält gesetzliche Pflichtangaben', async ({ page }) => {
  // 1. URL aufrufen und Server-Antwort abfangen
  const response = await page.goto('https://qa-ui-automation.blogspot.com/p/impressum.html');

  // 2. Prüfen, ob die Seite existiert (Status 200)
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL('https://qa-ui-automation.blogspot.com/p/impressum.html');

  // 3. Jetzt prüfen wir gezielt auf die Pflichtangabe im Text
  const pflichtAngabe = page.locator('text=Angaben gemäß');
  await expect(pflichtAngabe).toBeVisible({ timeout: 5000 });

  console.log('🎉 Impressum-URL erfolgreich verifiziert und Pflichtangaben gefunden (Status 200).');
});
