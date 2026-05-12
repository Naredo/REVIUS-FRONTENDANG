import { expect, test } from '@playwright/test';

async function gotoClean(page: any, path: string) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(path);
}

test.describe('Admin', () => {
  test('renderiza tabla de usuarios (mock mínimo)', async ({ page }) => {
    await page.route('**/api/user/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, userName: 'alice', email: 'alice@test.com', isAdmin: true },
          { id: 2, userName: 'bob', email: 'bob@test.com', isAdmin: false }
        ])
      });
    });

    await gotoClean(page, '/admin');

    await expect(page.getByRole('heading', { name: 'Panel de Administración' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    await expect(page.getByRole('cell', { name: 'alice', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'bob', exact: true })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Cambiar permisos' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eliminar usuario' }).first()).toBeVisible();
  });
});
