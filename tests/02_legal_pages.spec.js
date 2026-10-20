const { test, expect } = require('@playwright/test');

test('Datenschutz: Direktaufruf der URL liefert Status 200 OK', async ({ page }) => {
  // 1. Wir rufen die URL auf und fangen die Antwort (Response) des Servers ab
  const response = await page.goto('https://qa-ui-automation.blogspot.com/p/datenschutz.html');

  // 2. Wir prüfen direkt, ob der Server mit dem HTTP-Status 200 (Erfolgreich) antwortet
  expect(response.status()).toBe(200);

  // 3. Zusätzlicher Check: Steht die richtige URL oben in der Adresszeile des Browsers?
  // CLOUD-OPTIMIERUNG: 10 Sekunden Puffer für das asynchrone Laden der URL in der GitHub-Pipeline
  await expect(page).toHaveURL('https://qa-ui-automation.blogspot.com/p/datenschutz.html', { timeout: 10000 });
  
  console.log('🎉 Datenschutz-URL erfolgreich verifiziert (Status 200).');
});

test('Impressum: Direktaufruf liefert Status 200 OK und enthält gesetzliche Pflichtangaben', async ({ page }) => {
  // 1. URL aufrufen und Server-Antwort abfangen
  const response = await page.goto('https://qa-ui-automation.blogspot.com/p/impressum.html');

  // 2. Prüfen, ob die Seite existiert (Status 200)
  expect(response.status()).toBe(200);
  
  // CLOUD-OPTIMIERUNG: Erhöhtes Timeout für das Warten auf die korrekte URL
  await expect(page).toHaveURL('https://qa-ui-automation.blogspot.com/p/impressum.html', { timeout: 10000 });

  // 3. Jetzt prüfen wir gezielt auf die Pflichtangabe im Text
  const pflichtAngabe = page.locator('text=Angaben gemäß');
  
  // CLOUD-OPTIMIERUNG: Erhöht auf 10 Sekunden, falls das Text-Rendering auf den Cloud-Servern verzögert ist
  await expect(pflichtAngabe).toBeVisible({ timeout: 10000 });

  console.log('🎉 Impressum-URL erfolgreich verifiziert und Pflichtangaben gefunden (Status 200).');
});
