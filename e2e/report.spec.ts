import { expect, test } from '@playwright/test';

async function gotoClean(page: any, path: string) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(path);
}

test.describe('Report', () => {
  test('muestra validaciones de mínimo 50 caracteres al tocar campos', async ({ page }) => {
    await gotoClean(page, '/report/1');

    await expect(page.getByRole('heading', { name: 'Gestión de Reporte de Revisión' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Crear Reporte|Actualizar Reporte|Guardando\.{3}/i })).toBeDisabled();

    await page.locator('#resume').focus();
    await page.getByRole('heading', { name: 'Gestión de Reporte de Revisión' }).click();
    await expect(page.getByText('El resumen debe tener al menos 50 caracteres')).toBeVisible();

    await page.locator('#conclusions').focus();
    await page.getByRole('heading', { name: 'Gestión de Reporte de Revisión' }).click();
    await expect(page.getByText('Las conclusiones deben tener al menos 50 caracteres')).toBeVisible();

    await page.locator('#analysis').focus();
    await page.getByRole('heading', { name: 'Gestión de Reporte de Revisión' }).click();
    await expect(page.getByText('El análisis debe tener al menos 50 caracteres')).toBeVisible();
  });
});
