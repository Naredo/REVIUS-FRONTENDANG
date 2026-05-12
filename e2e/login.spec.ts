import { expect, test } from '@playwright/test';

async function gotoClean(page: any, path: string) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(path);
}

test.describe('Login', () => {
  test('renderiza login', async ({ page }) => {
    await gotoClean(page, '/login');

    await expect(page.getByText('Login')).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('valida username vacío', async ({ page }) => {
    await gotoClean(page, '/login');

    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Username vacío')).toBeVisible();
  });

  test('valida password vacío', async ({ page }) => {
    await gotoClean(page, '/login');

    await page.getByPlaceholder('Username').fill('usuario');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Password vacío')).toBeVisible();
  });

  test('valida password inválido (regex)', async ({ page }) => {
    await gotoClean(page, '/login');

    await page.getByPlaceholder('Username').fill('usuario');
    await page.getByPlaceholder('Password').fill('abc');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Password inválido')).toBeVisible();
  });

  test('navega a signup desde link', async ({ page }) => {
    await gotoClean(page, '/login');

    await page.getByText('Regístrate').click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });
});
