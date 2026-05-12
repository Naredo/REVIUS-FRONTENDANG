import { expect, test } from '@playwright/test';

async function gotoClean(page: any, path: string) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(path);
}

test.describe('Reviews', () => {
  test('muestra estado vacío cuando no hay userId en localStorage', async ({ page }) => {
    await gotoClean(page, '/reviews');

    await expect(page.getByRole('heading', { name: 'Mis Revisiones Sistemáticas' })).toBeVisible();
    await expect(page.getByText('No tienes revisiones sistemáticas aún')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear primera revisión' })).toBeVisible();
  });

  test('abre formulario de creación desde estado vacío', async ({ page }) => {
    await gotoClean(page, '/reviews');

    await page.getByRole('button', { name: 'Crear primera revisión' }).click();
    await expect(page.getByText('Crear Nueva Revisión Sistemática')).toBeVisible();
    await expect(page.locator('input#title')).toBeVisible();
    await expect(page.locator('textarea#description')).toBeVisible();
  });

  test('valida largo mínimo de título y descripción', async ({ page }) => {
    await gotoClean(page, '/reviews');

    await page.getByRole('button', { name: 'Crear primera revisión' }).click();

    await page.locator('input#title').fill('abc');
    await page.locator('textarea#description').fill('corto');

    // Marca campos como touched
    await page.locator('input#objective').click();

    await expect(page.getByText('El título debe tener al menos 5 caracteres')).toBeVisible();
    await expect(page.getByText('La descripción debe tener al menos 10 caracteres')).toBeVisible();
    await expect(page.getByRole('button', { name: /Crear Revisión|Guardar cambios/i })).toBeDisabled();
  });

  test('cierra el formulario con Cancelar', async ({ page }) => {
    await gotoClean(page, '/reviews');

    await page.getByRole('button', { name: 'Crear primera revisión' }).click();
    await expect(page.getByText('Crear Nueva Revisión Sistemática')).toBeVisible();

    // El botón de header cambia a "✕ Cancelar"
    await page.getByRole('button', { name: /Cancelar/i }).click();
    await expect(page.getByText('Crear Nueva Revisión Sistemática')).toHaveCount(0);
  });
});
