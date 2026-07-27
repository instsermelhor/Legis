/**
 * Legis Connect — E2E Test: Jornada Crítica de Onboarding de Advogado
 * Tags: @critical @onboarding @smoke
 * SLA: Deve completar em < 3 minutos
 * WCAG: Valida AA compliance em cada step
 */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Jornada Crítica: Advogado Onboarding @critical @smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Reset de estado: limpa cookies e local storage
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('Advogado cria conta, valida OAB e acessa dashboard', async ({ page }) => {
    const START = Date.now();
    
    // STEP 1: Navegar para cadastro
    await page.goto('/signup/lawyer');
    await expect(page).toHaveTitle(/Cadastro de Advogado/);
    await validateA11y(page, 'Signup Page');

    // STEP 2: Preencher dados básicos
    await page.getByTestId('input-name').fill('Dr. Carlos Silva OAB Test');
    await page.getByTestId('input-email').fill(`test+${Date.now()}@legis-e2e.com`);
    await page.getByTestId('input-password').fill('TestPass@2026#');
    await page.getByTestId('input-oab').fill('SP123456');
    await page.getByTestId('btn-validate-oab').click();

    // Aguarda validação OAB (mock no staging)
    await expect(page.getByTestId('oab-validated-badge')).toBeVisible({ timeout: 5000 });

    // STEP 3: Selecionar especialidades
    await page.getByTestId('specialty-CIVEL').click();
    await page.getByTestId('specialty-TRABALHISTA').click();
    await page.getByTestId('btn-continue').click();

    // STEP 4: Dashboard deve carregar
    await page.waitForURL('/dashboard', { timeout: 10_000 });
    await expect(page.getByTestId('welcome-message')).toContainText('Dr. Carlos');
    await expect(page.getByTestId('kpi-active-cases')).toBeVisible();
    await validateA11y(page, 'Dashboard Page');

    const DURATION_S = (Date.now() - START) / 1000;
    console.log(`✅ Onboarding concluído em ${DURATION_S.toFixed(1)}s`);
    expect(DURATION_S).toBeLessThan(180); // < 3 minutos SLA
  });

  test('Checkout de assinatura Professional completa sem erro @critical', async ({ page }) => {
    await page.goto('/subscription/plans');
    await validateA11y(page, 'Plans Page');
    
    await page.getByTestId('plan-PROFESSIONAL').click();
    await page.getByTestId('btn-subscribe').click();
    
    // Stripe Elements (iframe)
    const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]');
    await stripeFrame.getByPlaceholder('Card number').fill('4242424242424242');
    await stripeFrame.getByPlaceholder('MM / YY').fill('12/28');
    await stripeFrame.getByPlaceholder('CVC').fill('123');
    
    await page.getByTestId('btn-confirm-payment').click();
    await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 15_000 });
  });
});

async function validateA11y(page: Page, pageName: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  if (results.violations.length > 0) {
    console.warn(`⚠️ A11y violations em ${pageName}:`, JSON.stringify(results.violations, null, 2));
  }
  expect(results.violations, `WCAG 2.1 AA violations em "${pageName}"`).toHaveLength(0);
}
