import { expect, test } from '@playwright/test';

test('la app carga y renderiza app-root', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/REVIUSFRONTENDANG/i);
  await expect(page.locator('app-root')).toBeVisible();
});
