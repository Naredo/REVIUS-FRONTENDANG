import { expect, test } from '@playwright/test';

async function gotoClean(page: any, path: string) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(path);
}

test.describe('Protocol', () => {
  test('permite navegar entre tabs principales', async ({ page }) => {
    await gotoClean(page, '/protocol/1');

    await expect(page.getByRole('heading', { name: /Gestión de Protocolo|Fase de ejecución/i })).toBeVisible();

    await expect(page.getByText('Información Básica del Protocolo')).toBeVisible();

    await page.getByRole('button', { name: 'Palabras Clave' }).click();
    await expect(page.getByRole('heading', { name: 'Palabras Clave' })).toBeVisible();

    await page.getByRole('button', { name: 'Preguntas de Investigación' }).click();
    await expect(page.getByRole('heading', { name: 'Preguntas de Investigación' })).toBeVisible();

    await page.getByRole('button', { name: 'Fuentes' }).click();
    await expect(page.getByRole('heading', { name: 'Fuentes de Datos' })).toBeVisible();

    await page.getByRole('button', { name: 'Criterios de Selección' }).click();
    await expect(page.getByRole('heading', { name: 'Criterios de Selección', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Formularios' }).click();
    await expect(page.getByRole('heading', { name: 'Formularios de Calidad y Extracción' })).toBeVisible();
  });
});
