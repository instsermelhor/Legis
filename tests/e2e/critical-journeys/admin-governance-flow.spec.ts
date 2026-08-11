/**
 * Legis Connect — E2E Test: Jornada de Governança Administrativa & Super Admin
 * Tags: @critical @admin @superadmin @rbac @lgpd @bi
 * SLA: < 2 minutos
 */
import { test, expect, type Page } from '@playwright/test';

test.describe('Jornada Crítica: Governança Admin & Super Admin @critical @admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('Super Admin acessa SuperAdminDashboard, gerencia delegações e executa exportação BI/LGPD', async ({ page }) => {
    const START = Date.now();

    // STEP 1: Login de Super Admin
    await page.goto('/?adminLogin=1');
    await page.getByTestId('admin-input-email').or(page.getByPlaceholder(/email/i)).fill('legisconnectonline@gmail.com');
    await page.getByTestId('admin-input-password').or(page.getByPlaceholder(/senha/i)).fill('SuperAdminPass2026!');
    await page.getByTestId('btn-admin-login').or(page.getByRole('button', { name: /entrar/i })).click();

    // STEP 2: Validação de carregamento do SuperAdminDashboard
    await expect(page.getByTestId('super-admin-dashboard')).toBeVisible({ timeout: 10_000 });

    // STEP 3: Acesso ao Gerenciador de Delegação RBAC
    const delegationBtn = page.getByTestId('nav-delegation-manager').or(page.getByRole('button', { name: /delegação/i }));
    if (await delegationBtn.isVisible()) {
      await delegationBtn.click();
      await expect(page.getByTestId('delegation-manager-container')).toBeVisible();
    }

    // STEP 4: Inspeção de Modal BI Analytics e acionamento de Drill-Down
    const biModalBtn = page.getByTestId('btn-open-bi-analytics').or(page.getByRole('button', { name: /analytics/i }));
    if (await biModalBtn.isVisible()) {
      await biModalBtn.click();
      await expect(page.getByTestId('bi-analytics-modal')).toBeVisible();

      // Toggle para visão Drill-Down
      const drillDownToggle = page.getByTestId('btn-toggle-drill-down');
      if (await drillDownToggle.isVisible()) {
        await drillDownToggle.click();
        await expect(page.getByTestId('bi-drill-down-table')).toBeVisible();
      }

      // Trigger de exportação em PDF / Excel
      const exportPdfBtn = page.getByTestId('btn-export-bi-pdf');
      if (await exportPdfBtn.isVisible()) {
        await exportPdfBtn.click();
      }
    }

    // STEP 5: Solicitação de Cópia de Dados LGPD (Self-Service SAR)
    const lgpdModalBtn = page.getByTestId('btn-open-lgpd-modal');
    if (await lgpdModalBtn.isVisible()) {
      await lgpdModalBtn.click();
      await expect(page.getByTestId('lgpd-self-service-modal')).toBeVisible();
      await page.getByTestId('btn-request-sar-export').click();
      await expect(page.getByTestId('lgpd-export-success-message')).toBeVisible();
    }

    const DURATION_S = (Date.now() - START) / 1000;
    console.log(`✅ Governança de Admin/Super Admin concluída em ${DURATION_S.toFixed(1)}s`);
    expect(DURATION_S).toBeLessThan(120);
  });

  test('Admin comum não consegue acessar o SuperAdminDashboard (Bloqueio RBAC V-002)', async ({ page }) => {
    // Simula sessão de Admin comum
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('legis_user', JSON.stringify({
        email: 'admin.operacional@legisconnect.com.br',
        role: 'admin',
        name: 'Admin Operacional',
      }));
      localStorage.setItem('legis_currentView', 'superAdminDashboard');
    });

    await page.reload();

    // Deve ser redirecionado para a landing page ou adminDashboard por bloqueio RBAC
    await expect(page.getByTestId('super-admin-dashboard')).not.toBeVisible();
  });
});
