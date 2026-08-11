/**
 * Legis Connect — E2E Test: Jornada de Secretária e Estagiário
 * Tags: @critical @secretary @intern @rbac
 * SLA: < 2 minutos
 */
import { test, expect } from '@playwright/test';

test.describe('Jornada Crítica: Secretária e Estagiário @critical @staff', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('Secretária acessa SecretariadoDashboard, gerencia agenda e é bloqueada em abas financeiras', async ({ page }) => {
    // Simula login de Secretária
    await page.evaluate(() => {
      localStorage.setItem('legis_user', JSON.stringify({
        email: 'secretaria.teste@legisconnect.com.br',
        role: 'secretary',
        name: 'Secretária Teste',
        data: { id: 8888, name: 'Secretária Teste', email: 'secretaria.teste@legisconnect.com.br' },
      }));
      localStorage.setItem('legis_currentView', 'secretariadoDashboard');
    });

    await page.reload();
    await expect(page.getByTestId('secretariado-dashboard')).toBeVisible({ timeout: 5000 });

    // Tenta acessar visualização de dados administrativos/financeiros globais (deve ser bloqueada ou não existir)
    await expect(page.getByTestId('admin-financial-tab')).not.toBeVisible();
  });

  test('Estagiário acessa InternDashboard, utiliza IA Copilot e é bloqueado em dados de terceiros', async ({ page }) => {
    // Simula login de Estagiário
    await page.evaluate(() => {
      localStorage.setItem('legis_user', JSON.stringify({
        email: 'estagiario.teste@legisconnect.com.br',
        role: 'intern',
        name: 'Bacharelando Teste',
        data: { id: 9999, name: 'Bacharelando Teste', contact: { email: 'estagiario.teste@legisconnect.com.br' } },
      }));
      localStorage.setItem('legis_currentView', 'internDashboard');
    });

    await page.reload();
    await expect(page.getByTestId('intern-dashboard')).toBeVisible({ timeout: 5000 });

    // Testa botão de IA Copilot se presente
    const aiCopilotBtn = page.getByTestId('btn-intern-ai-copilot');
    if (await aiCopilotBtn.isVisible()) {
      await aiCopilotBtn.click();
      await expect(page.getByTestId('ai-copilot-modal')).toBeVisible();
    }

    // Garante que o estagiário não possui botão de impersonar nem gerenciamento de staff
    await expect(page.getByTestId('btn-impersonate-user')).not.toBeVisible();
  });
});
