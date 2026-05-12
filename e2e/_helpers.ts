import type { Page, Route } from '@playwright/test';

export async function clearStorageAndGoto(page: Page, path: string) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(path);
}

function base64UrlEncodeJson(value: unknown): string {
  const json = JSON.stringify(value);
  return Buffer.from(json)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function makeFakeJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'none', typ: 'JWT' };
  const encodedHeader = base64UrlEncodeJson(header);
  const encodedPayload = base64UrlEncodeJson(payload);
  // jwt-decode solo necesita 2 segmentos base64url válidos (header.payload).
  // Dejamos un tercer segmento dummy.
  return `${encodedHeader}.${encodedPayload}.x`;
}

export async function mockAuthHappyPath(page: Page, opts?: { userId?: number; userName?: string; roles?: string[] }) {
  const userId = opts?.userId ?? 123;
  const userName = opts?.userName ?? 'usuario';
  const roles = opts?.roles ?? ['ROLE_USER'];

  const now = Math.floor(Date.now() / 1000);
  const token = makeFakeJwt({ sub: userName, roles, iat: now, exp: now + 3600 });

  await page.route('**/api/login/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ userId, tokenDTO: { token } }),
    });
  });

  await page.route('**/api/login/validate**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        userId,
        userName,
        completeName: 'Usuario de Prueba',
        email: 'user@test.com',
        workField: 'Software',
        institution: 'Uni',
        isAdmin: roles.includes('ROLE_ADMIN'),
      }),
    });
  });

  return { userId, userName, roles, token };
}

export async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}
