import { expect, test } from '@playwright/test';

async function gotoClean(page: any, path: string) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(path);
}

test.describe('Signup', () => {
  test('valida username vacío', async ({ page }) => {
    await gotoClean(page, '/signup');

    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Username vacío')).toBeVisible();
  });

  test('valida contraseñas no coinciden', async ({ page }) => {
    await gotoClean(page, '/signup');

    await page.getByPlaceholder('Username').fill('usuario');
    await page.getByPlaceholder('Password', { exact: true }).fill('Abcdefg1!');
    await page.getByPlaceholder('Confirm password').fill('Abcdefg1?');

    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();
  });

  test('valida email inválido y password inválido (regex)', async ({ page }) => {
    await gotoClean(page, '/signup');

    await page.getByPlaceholder('Username').fill('usuario');
    await page.getByPlaceholder('Password', { exact: true }).fill('Abcdefg1'); // falta caracter especial
    await page.getByPlaceholder('Confirm password').fill('Abcdefg1');
    await page.getByPlaceholder('Name', { exact: true }).fill('Nombre Apellido');
    await page.getByPlaceholder('Email').fill('no-es-email');

    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Email inválido')).toBeVisible();

    // Corrige email para llegar a la validación de password
    await page.getByPlaceholder('Email').fill('user@test.com');
    await page.getByPlaceholder('Work field', { exact: true }).fill('Software');
    await page.getByPlaceholder('Institution', { exact: true }).fill('Uni');

    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByText('Password inválido')).toBeVisible();
  });
});
