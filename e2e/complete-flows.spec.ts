import { expect, test } from '@playwright/test';
import { clearStorageAndGoto, fulfillJson, mockAuthHappyPath } from './_helpers';

test.describe('Flujos completos (con mocks)', () => {
  test('login OK → navega a /reviews y renderiza lista', async ({ page }) => {
    const auth = await mockAuthHappyPath(page, { userId: 123, userName: 'usuario' });

    // La página /reviews usa fetch directo a user-service (9002)
    await page.route(`**/api/user/${auth.userId}/my-principal-reviews`, async (route) => {
      await fulfillJson(route, [
        {
          id: 1,
          title: 'SLR Demo',
          description: 'Descripción suficientemente larga',
          objective: 'Objetivo',
          workField: 'Software',
          publicVisibility: false,
          scope: null,
          status: 'draft',
        },
      ]);
    });

    await clearStorageAndGoto(page, '/login');
    await page.getByPlaceholder('Username').fill('usuario');
    await page.getByPlaceholder('Password').fill('Abcdefg1!');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/reviews$/);
    await expect(page.getByRole('heading', { name: 'Mis Revisiones Sistemáticas' })).toBeVisible();
    await expect(page.getByText('SLR Demo')).toBeVisible();
  });

  test('crear SLR desde /reviews (POST mock) y aparece en la lista', async ({ page }) => {
    // Pre-carga sesión sin pasar por login UI
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'x');
      localStorage.setItem('userId', '123');
      localStorage.setItem('user', JSON.stringify({ userName: 'usuario', isAdmin: false }));
    });

    // Evita polling/fetch inicial fallando: devuelve lista vacía.
    await page.route('**/api/user/123/my-principal-reviews', async (route) => {
      await fulfillJson(route, []);
    });

    await page.route('**/api/user/123/review/create', async (route) => {
      const body = (await route.request().postDataJSON()) as any;
      await fulfillJson(route, { id: 99, ...body, status: 'draft', scope: null, collaboratorResearchers: [] });
    });

    await page.goto('/reviews');

    const newReviewBtn = page.getByRole('button', { name: '+ Nueva Revisión' });
    if ((await newReviewBtn.count()) > 0) {
      await newReviewBtn.first().click();
    } else {
      await page.getByRole('button', { name: 'Crear primera revisión' }).first().click();
    }
    await page.locator('input#title').fill('Mi SLR');
    await page.locator('textarea#description').fill('Descripción larga para pasar validación');
    await page.locator('input#objective').fill('Objetivo');
    await page.locator('input#workField').fill('Software');

    // En el form actual, el checkbox tiene Validators.required, así que debe estar en true.
    await page.locator('#publicVisibility').check();

    // checkbox opcional: lo dejamos por defecto
    const createBtn = page.getByRole('button', { name: /Crear Revisión/i });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await expect(page.getByText('Mi SLR')).toBeVisible();
  });

  test('ver detalles → buscar colaborador por email → añadir colaborador', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'x');
      localStorage.setItem('userId', '123');
      localStorage.setItem('user', JSON.stringify({ userName: 'usuario', isAdmin: false }));
    });

    // Lista
    await page.route('**/api/user/123/my-principal-reviews', async (route) => {
      await fulfillJson(route, [
        {
          id: 1,
          title: 'SLR Demo',
          description: 'Descripción',
          objective: 'Objetivo',
          workField: 'Software',
          publicVisibility: false,
          scope: null,
          status: 'draft',
        },
      ]);
    });

    await page.route('**/api/user/email/**', async (route) => {
      await fulfillJson(route, { id: 55, userName: 'colab', completeName: 'Colab', email: 'colab@test.com' });
    });

    await page.route('**/api/user/review/1/add-researcher/**', async (route) => {
      // HttpClient espera JSON por defecto; si devolvemos texto plano, cae en error.
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    // Después de añadir colaborador, la UI vuelve a llamar getSLRById(1). Respondemos con collaborator.
    let detailCallCount = 0;
    await page.route('**/api/review/1', async (route) => {
      detailCallCount++;
      await fulfillJson(route, {
        id: 1,
        title: 'SLR Demo',
        description: 'Descripción',
        objective: 'Objetivo',
        workField: 'Software',
        publicVisibility: false,
        scope: null,
        status: 'draft',
        principalResearcher: { id: 123, userName: 'usuario', completeName: 'Usuario' },
        collaboratorResearchers: detailCallCount >= 2 ? [{ id: 55, userName: 'colab', completeName: 'Colab', email: 'colab@test.com' }] : [],
        protocol: null,
        report: null,
      });
    });

    await page.goto('/reviews');
    await page.getByRole('button', { name: 'Ver detalles' }).click();
    await expect(page.getByText('Detalles de la Revisión')).toBeVisible();

    await page.getByPlaceholder('usuario@ejemplo.com').fill('colab@test.com');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('colab@test.com')).toBeVisible();
    await page.getByRole('button', { name: 'Añadir colaborador' }).click();

    await expect(page.getByText('Colaborador añadido correctamente')).toBeVisible();
    await expect(page.getByText('Colab', { exact: true })).toBeVisible();
  });

  test('crear protocolo en /protocol/:slrId (POST mock) y habilita tabs', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'x');
      localStorage.setItem('userId', '123');
      localStorage.setItem('user', JSON.stringify({ userName: 'usuario', isAdmin: false }));
    });

    // SLR sin protocolo
    await page.route('**/api/review/1', async (route) => {
      await fulfillJson(route, { id: 1, title: 'SLR Demo', protocol: null, report: null });
    });

    // Crear protocolo
    await page.route('**/api/review/protocol/1/create', async (route) => {
      const body = (await route.request().postDataJSON()) as any;
      await fulfillJson(route, { id: 10, ...body, keywords: [], mainQuestions: [], sources: [] });
    });

    page.on('dialog', async (d) => {
      await d.accept();
    });

    await page.goto('/protocol/1');
    await expect(page.getByText('Información Básica del Protocolo')).toBeVisible();

    await page.locator('#sourcesSearchMethods').fill('Métodos');
    await page.locator('#studiesTypesDefinition').fill('Tipos');
    await page.locator('#studiesInitialSelection').fill('Selección');
    await page.locator('#studiesQualityEvaluation').fill('Calidad');

    await page.getByRole('button', { name: 'Crear Protocolo' }).click();
    await expect(page.getByRole('button', { name: 'Actualizar Protocolo' })).toBeVisible();

    // Ya hay protocolId, debería desaparecer el mensaje de "Primero debes crear..." en Keywords
    await page.getByRole('button', { name: 'Palabras Clave' }).click();
    await expect(page.getByText('Primero debes crear el protocolo', { exact: false })).toHaveCount(0);
  });

  test('crear reporte en /report/:slrId (POST mock) y vuelve a /reviews', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'x');
      localStorage.setItem('userId', '123');
      localStorage.setItem('user', JSON.stringify({ userName: 'usuario', isAdmin: false }));
    });

    // SLR sin report
    await page.route('**/api/review/1', async (route) => {
      await fulfillJson(route, { id: 1, title: 'SLR Demo', protocol: null, report: null });
    });

    await page.route('**/api/review/report/1/create', async (route) => {
      const body = (await route.request().postDataJSON()) as any;
      await fulfillJson(route, { id: 77, ...body });
    });

    page.on('dialog', async (d) => {
      await d.accept();
    });

    await page.goto('/report/1');
    await page.locator('#resume').fill('R'.repeat(60));
    await page.locator('#conclusions').fill('C'.repeat(60));
    await page.locator('#analysis').fill('A'.repeat(60));

    await page.getByRole('button', { name: 'Crear Reporte' }).click();

    await expect(page).toHaveURL(/\/reviews$/);
  });
});
